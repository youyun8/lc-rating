import { LC_HOST_EN, LC_HOST_ZH } from "@/config/constants";
import type { Language } from "@/types/siteStorage";

const LEETCODE_HOST_RE = /^https?:\/\/(?:www\.)?leetcode\.(?:cn|com)/i;
const LEETCODE_PROBLEM_RE =
  /^(https?:\/\/(?:www\.)?leetcode\.(?:cn|com))\/problems\/([^/?#]+)([/?#].*)?$/i;

export function getLeetCodeHost(linkLanguage: Language) {
  return linkLanguage === "zh" ? LC_HOST_ZH : LC_HOST_EN;
}

export function getLeetCodeProblemUrl(slug: string, linkLanguage: Language) {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
  return `${getLeetCodeHost(linkLanguage)}/problems/${normalizedSlug}`;
}

export function isLeetCodeUrl(href: string | null) {
  return Boolean(href && LEETCODE_HOST_RE.test(href));
}

export function resolveLeetCodeProblemHref(
  href: string | null,
  linkLanguage: Language,
) {
  if (!href) {
    return href;
  }

  const match = href.match(LEETCODE_PROBLEM_RE);
  if (!match) {
    return href;
  }

  const [, , slug, suffix = ""] = match;
  return `${getLeetCodeHost(linkLanguage)}/problems/${slug}${suffix}`;
}
