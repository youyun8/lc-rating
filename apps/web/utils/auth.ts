import { LC_RATING_AUTH_TOKEN_KEY } from "@/config/constants";

interface JWTPayload {
  userId: string;
  username: string;
  exp: number;
  iat: number;
}

/**
 * Decode the custom JWT token payload (base64-encoded JSON before the signature).
 * Returns null if the token is missing, malformed, or expired.
 */
export function decodeAuthToken(token: string | null): JWTPayload | null {
  if (!token) return null;
  try {
    const [dataB64] = token.split(".");
    if (!dataB64) return null;
    const json = atob(dataB64);
    const payload: JWTPayload = JSON.parse(json);
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Read the stored auth token and decode it. */
export function getStoredAuthPayload(): JWTPayload | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(LC_RATING_AUTH_TOKEN_KEY);
  return decodeAuthToken(token);
}

/** Extract a human-readable error message from an unknown caught value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error);
}
