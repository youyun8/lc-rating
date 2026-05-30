import { API_BASE } from "@/config/constants";
import type { Options } from "@/hooks/useOptions";
import type { ProblemSolutions } from "@/hooks/useProblemSolutions";
import type {
  Language,
  SiteStorageData,
  SiteStoragePatch,
  ThemePreference,
} from "@/types/siteStorage";
import { AuthExpiredError, clearAuthToken, isTokenValid } from "./auth";

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

function toStringRecord(value: unknown): Record<string, string> | undefined {
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

function toNumberRecord(value: unknown): Record<string, number> | undefined {
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

function toProblemSolutions(value: unknown): ProblemSolutions | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return Object.entries(value).reduce<ProblemSolutions>((acc, [key, item]) => {
    if (!Array.isArray(item)) {
      return acc;
    }

    const solutions = item.flatMap((entry, index) => {
      if (
        isRecord(entry) &&
        typeof entry.code === "string" &&
        typeof entry.language === "string"
      ) {
        return [
          {
            id: typeof entry.id === "string" ? entry.id : `${key}-${index}`,
            title: typeof entry.title === "string" ? entry.title : "",
            code: entry.code,
            language: entry.language,
          },
        ];
      }
      return [];
    });

    if (solutions.length > 0) {
      acc[key] = solutions;
    }
    return acc;
  }, {});
}

function toOptions(value: unknown): Options | undefined {
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

export function normalizeCloudSiteStorage(input: unknown): SiteStoragePatch {
  if (!isRecord(input)) {
    return {};
  }

  const payload =
    hasOwn(input, "result") && isRecord(input.result) ? input.result : input;
  const normalized: SiteStoragePatch = {};

  if (hasOwn(payload, "theme") && isThemePreference(payload.theme)) {
    normalized.theme = payload.theme;
  }

  if (hasOwn(payload, "tagLanguage") && isLanguage(payload.tagLanguage)) {
    normalized.tagLanguage = payload.tagLanguage;
  }

  if (hasOwn(payload, "linkLanguage") && isLanguage(payload.linkLanguage)) {
    normalized.linkLanguage = payload.linkLanguage;
  }

  if (hasOwn(payload, "premium") && typeof payload.premium === "boolean") {
    normalized.premium = payload.premium;
  }

  if (hasOwn(payload, "options")) {
    const options = toOptions(payload.options);
    if (options !== undefined) {
      normalized.options = options;
    }
  }

  if (hasOwn(payload, "progress")) {
    const progress = toStringRecord(payload.progress);
    if (progress !== undefined) {
      normalized.progress = progress;
    }
  }

  if (hasOwn(payload, "progressUpdatedAt")) {
    const progressUpdatedAt = toNumberRecord(payload.progressUpdatedAt);
    if (progressUpdatedAt !== undefined) {
      normalized.progressUpdatedAt = progressUpdatedAt;
    }
  }

  if (hasOwn(payload, "problemNotes")) {
    const problemNotes = toStringRecord(payload.problemNotes);
    if (problemNotes !== undefined) {
      normalized.problemNotes = problemNotes;
    }
  }

  if (hasOwn(payload, "problemNotesUpdatedAt")) {
    const problemNotesUpdatedAt = toNumberRecord(payload.problemNotesUpdatedAt);
    if (problemNotesUpdatedAt !== undefined) {
      normalized.problemNotesUpdatedAt = problemNotesUpdatedAt;
    }
  }

  if (hasOwn(payload, "problemSolutions")) {
    const problemSolutions = toProblemSolutions(payload.problemSolutions);
    if (problemSolutions !== undefined) {
      normalized.problemSolutions = problemSolutions;
    }
  }

  if (hasOwn(payload, "problemSolutionsUpdatedAt")) {
    const problemSolutionsUpdatedAt = toNumberRecord(
      payload.problemSolutionsUpdatedAt,
    );
    if (problemSolutionsUpdatedAt !== undefined) {
      normalized.problemSolutionsUpdatedAt = problemSolutionsUpdatedAt;
    }
  }

  return normalized;
}

export async function pullCloudSiteStorage(token: string) {
  if (!isTokenValid(token)) {
    clearAuthToken();
    throw new AuthExpiredError();
  }

  const response = await fetch(`${API_BASE}/api/getprogress`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    clearAuthToken();
    throw new AuthExpiredError();
  }

  const data = await response.json();
  if (!data?.success) {
    throw new Error(data?.message ?? "拉取失敗");
  }

  return normalizeCloudSiteStorage(data);
}

export async function pushCloudSiteStorage(
  token: string,
  siteStorage: SiteStorageData,
) {
  if (!isTokenValid(token)) {
    clearAuthToken();
    throw new AuthExpiredError();
  }

  const response = await fetch(`${API_BASE}/api/uploadprogress`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(siteStorage),
  });

  if (response.status === 401) {
    clearAuthToken();
    throw new AuthExpiredError();
  }

  const data = await response.json();
  if (!data?.success) {
    throw new Error(data?.message ?? "上傳失敗");
  }
}

/** Check if the backend is reachable (for diagnostics). */
export async function checkBackendHealth(): Promise<{
  ok: boolean;
  message: string;
}> {
  if (!API_BASE) {
    return { ok: false, message: "未設定後端 (API_BASE)" };
  }
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json();
    return {
      ok: data?.success === true,
      message: data?.success
        ? "後端正常運作"
        : `後端回應異常: ${response.status}`,
    };
  } catch {
    return { ok: false, message: "無法連線至後端" };
  }
}
