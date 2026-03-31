import { API_BASE } from "@/config/constants";
import type { Options } from "@/hooks/useOptions";
import type {
  Language,
  SiteStorageData,
  SiteStoragePatch,
  ThemePreference,
} from "@/types/siteStorage";

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

  return normalized;
}

export async function pullCloudSiteStorage(token: string) {
  const response = await fetch(`${API_BASE}/api/getprogress`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
  const response = await fetch(`${API_BASE}/api/uploadprogress`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(siteStorage),
  });
  const data = await response.json();
  if (!data?.success) {
    throw new Error(data?.message ?? "上傳失敗");
  }
}
