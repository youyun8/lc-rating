export function safeParseJSON<T>(jsonStr: string): T | undefined {
  try {
    return JSON.parse(jsonStr);
  } catch {
    console.error(`[safeParseJSON] Error parsing JSON: ${jsonStr}`);
    return undefined;
  }
}
