import { Hono } from "hono";
import { cors } from "hono/cors";

// Types
interface Bindings {
  [key: string]: unknown;
  LC_RATING_DATA: KVNamespace;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  ALLOWED_ORIGINS: string;
}

type Language = "zh" | "en";
type ThemePreference = "system" | "light" | "dark";

interface SiteOption {
  key: string;
  label: string;
  color: string;
}

interface UserSiteSettings {
  theme?: ThemePreference;
  tagLanguage?: Language;
  linkLanguage?: Language;
  premium?: boolean;
  options?: Record<string, SiteOption>;
  progress?: Record<string, string>;
  progressUpdatedAt?: Record<string, number>;
  updatedAt: string;
}

const app = new Hono<{ Bindings: Bindings }>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function isLanguage(value: unknown): value is Language {
  return value === "zh" || value === "en";
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function toStringRecord(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  return Object.entries(value).reduce<Record<string, string>>(
    (acc, [key, item]) => {
      if (typeof item === "string") {
        acc[key] = item;
      }
      return acc;
    },
    {},
  );
}

function toNumberRecord(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  return Object.entries(value).reduce<Record<string, number>>(
    (acc, [key, item]) => {
      if (typeof item === "number") {
        acc[key] = item;
      }
      return acc;
    },
    {},
  );
}

function toOptions(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, item]) => {
      if (!isRecord(item)) {
        return [];
      }

      if (
        typeof item.key !== "string" ||
        typeof item.label !== "string" ||
        typeof item.color !== "string"
      ) {
        return [];
      }

      return [[key, { key: item.key, label: item.label, color: item.color }]];
    }),
  );
}

function normalizeSiteSettings(
  value: unknown,
): Omit<UserSiteSettings, "updatedAt"> {
  if (!isRecord(value)) {
    return {};
  }

  const normalized: Omit<UserSiteSettings, "updatedAt"> = {};

  if (hasOwn(value, "theme") && isThemePreference(value.theme)) {
    normalized.theme = value.theme;
  }

  if (hasOwn(value, "tagLanguage") && isLanguage(value.tagLanguage)) {
    normalized.tagLanguage = value.tagLanguage;
  }

  if (hasOwn(value, "linkLanguage") && isLanguage(value.linkLanguage)) {
    normalized.linkLanguage = value.linkLanguage;
  }

  if (hasOwn(value, "premium") && typeof value.premium === "boolean") {
    normalized.premium = value.premium;
  }

  if (hasOwn(value, "options")) {
    const options = toOptions(value.options);
    if (options !== undefined) {
      normalized.options = options;
    }
  }

  if (hasOwn(value, "progress")) {
    const progress = toStringRecord(value.progress);
    if (progress !== undefined) {
      normalized.progress = progress;
    }
  }

  if (hasOwn(value, "progressUpdatedAt")) {
    const progressUpdatedAt = toNumberRecord(value.progressUpdatedAt);
    if (progressUpdatedAt !== undefined) {
      normalized.progressUpdatedAt = progressUpdatedAt;
    }
  }

  return normalized;
}

// CORS middleware
app.use("*", async (c, next) => {
  const env = c.env as Bindings;
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(",") || ["*"];
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
  const env = c.env as Bindings;
  const clientId = env.GITHUB_CLIENT_ID;
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
  const env = c.env as Bindings;
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
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
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
      env.JWT_SECRET,
    );

    // Redirect back to frontend with token
    const allowedOrigins = env.ALLOWED_ORIGINS?.split(",") || [
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

// Upload site data endpoint
app.post("/api/uploadprogress", async (c) => {
  const env = c.env as Bindings;
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyJWT(token, env.JWT_SECRET);
    if (!payload) {
      return c.json({ success: false, message: "Invalid token" }, 401);
    }

    const body = await c.req.json();
    const existingData = await env.LC_RATING_DATA.get(`user:${payload.userId}`);
    const existingSettings = existingData
      ? normalizeSiteSettings(JSON.parse(existingData))
      : {};
    const incomingSettings = normalizeSiteSettings(body);

    const userSiteSettings: UserSiteSettings = {
      ...existingSettings,
      ...incomingSettings,
      updatedAt: new Date().toISOString(),
    };

    // Store in KV
    await env.LC_RATING_DATA.put(
      `user:${payload.userId}`,
      JSON.stringify(userSiteSettings),
    );

    return c.json({ success: true, message: "Site data saved" });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ success: false, message: "Failed to save site data" }, 500);
  }
});

// Get site data endpoint
app.get("/api/getprogress", async (c) => {
  const env = c.env as Bindings;
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyJWT(token, env.JWT_SECRET);
    if (!payload) {
      return c.json({ success: false, message: "Invalid token" }, 401);
    }

    // Get from KV
    const data = await env.LC_RATING_DATA.get(`user:${payload.userId}`);

    if (!data) {
      return c.json({
        success: true,
        result: {},
      });
    }

    const userSiteSettings = normalizeSiteSettings(JSON.parse(data));

    return c.json({
      success: true,
      result: userSiteSettings,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return c.json({ success: false, message: "Failed to get site data" }, 500);
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
