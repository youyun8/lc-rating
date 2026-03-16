import { Hono } from "hono";
import { cors } from "hono/cors";

// Types
interface Bindings {
  LC_RATING_DATA: KVNamespace;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  ALLOWED_ORIGINS: string;
}

interface UserProgress {
  progress: Record<string, string>;
  progressUpdatedAt: Record<string, number>;
  updatedAt: string;
}

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use("*", async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(",") || ["*"];
  const corsMiddleware = cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// GitHub OAuth login endpoint
app.get("/api/login/github", async (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID;
  const redirectUri = `${new URL(c.req.url).origin}/api/callback`;

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?` +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "read:user",
    });

  return c.redirect(githubAuthUrl);
});

// GitHub OAuth callback endpoint
app.get("/api/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) {
    return c.json({ success: false, message: "No code provided" }, 400);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: c.env.GITHUB_CLIENT_ID,
          client_secret: c.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      },
    );

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
    };

    if (tokenData.error || !tokenData.access_token) {
      return c.json(
        { success: false, message: "Failed to get access token" },
        400,
      );
    }

    // Get user info from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
        "User-Agent": "lc-rating-backend",
      },
    });

    const userData = (await userResponse.json()) as {
      id: number;
      login: string;
    };

    // Create JWT token
    const jwtToken = await createJWT(
      {
        userId: userData.id.toString(),
        username: userData.login,
      },
      c.env.JWT_SECRET,
    );

    // Redirect back to frontend with token
    const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3001",
    ];
    const redirectOrigin = allowedOrigins[0].trim();
    const redirectUrl = `${redirectOrigin}/lc-rating?token=${jwtToken}`;

    return c.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth error:", error);
    return c.json({ success: false, message: "Authentication failed" }, 500);
  }
});

// Upload progress endpoint
app.post("/api/uploadprogress", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    if (!payload) {
      return c.json({ success: false, message: "Invalid token" }, 401);
    }

    const body = (await c.req.json()) as {
      progress: Record<string, string>;
      progressUpdatedAt: Record<string, number>;
    };

    const userProgress: UserProgress = {
      progress: body.progress || {},
      progressUpdatedAt: body.progressUpdatedAt || {},
      updatedAt: new Date().toISOString(),
    };

    // Store in KV
    await c.env.LC_RATING_DATA.put(
      `user:${payload.userId}`,
      JSON.stringify(userProgress),
    );

    return c.json({ success: true, message: "Progress saved" });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ success: false, message: "Failed to save progress" }, 500);
  }
});

// Get progress endpoint
app.get("/api/getprogress", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    if (!payload) {
      return c.json({ success: false, message: "Invalid token" }, 401);
    }

    // Get from KV
    const data = await c.env.LC_RATING_DATA.get(`user:${payload.userId}`);

    if (!data) {
      return c.json({
        success: true,
        result: { progress: {}, progressUpdatedAt: {} },
      });
    }

    const userProgress: UserProgress = JSON.parse(data);

    return c.json({
      success: true,
      result: {
        progress: userProgress.progress,
        progressUpdatedAt: userProgress.progressUpdatedAt,
      },
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return c.json({ success: false, message: "Failed to get progress" }, 500);
  }
});

// Health check
app.get("/api/health", (c) => {
  return c.json({ success: true, message: "OK" });
});

// JWT utilities
async function createJWT(
  payload: { userId: string; username: string },
  secret: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(
    JSON.stringify({
      ...payload,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      iat: Date.now(),
    }),
  );

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, data);
  const base64Data = btoa(String.fromCharCode(...new Uint8Array(data)));
  const base64Sig = btoa(String.fromCharCode(...new Uint8Array(signature)));

  return `${base64Data}.${base64Sig}`;
}

async function verifyJWT(
  token: string,
  secret: string,
): Promise<{ userId: string; username: string } | null> {
  try {
    const [dataB64, sigB64] = token.split(".");
    if (!dataB64 || !sigB64) return null;

    const encoder = new TextEncoder();
    const data = new Uint8Array([...atob(dataB64)].map((c) => c.charCodeAt(0)));
    const signature = new Uint8Array(
      [...atob(sigB64)].map((c) => c.charCodeAt(0)),
    );

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const isValid = await crypto.subtle.verify("HMAC", key, signature, data);
    if (!isValid) return null;

    const payload = JSON.parse(new TextDecoder().decode(data));
    if (payload.exp < Date.now()) return null;

    return { userId: payload.userId, username: payload.username };
  } catch {
    return null;
  }
}

export default app;
