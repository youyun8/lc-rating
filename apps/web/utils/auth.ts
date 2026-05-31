import { LC_RATING_AUTH_TOKEN_KEY } from "@/config/constants";

export interface JWTPayload {
  userId: string;
  username: string;
  exp: number;
  iat: number;
}

/**
 * Error thrown when the server rejects a token (401).
 * Components can check `instanceof AuthExpiredError` to prompt re-login.
 */
export class AuthExpiredError extends Error {
  constructor(message = "登入已過期，請重新登入") {
    super(message);
    this.name = "AuthExpiredError";
  }
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

/**
 * Decode without checking expiry — useful for showing token info in diagnostics.
 */
export function decodeAuthTokenUnchecked(
  token: string | null,
): JWTPayload | null {
  if (!token) return null;
  try {
    const [dataB64] = token.split(".");
    if (!dataB64) return null;
    const json = atob(dataB64);
    return JSON.parse(json) as JWTPayload;
  } catch {
    return null;
  }
}

/** Check whether the stored token exists and has not expired. */
export function isTokenValid(token: string | null): boolean {
  return decodeAuthToken(token) !== null;
}

/** Remove the stored auth token and notify other components. */
export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LC_RATING_AUTH_TOKEN_KEY);
  window.dispatchEvent(new Event("lc-rating-auth-update"));
}

/** Extract a human-readable error message from an unknown caught value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error);
}
