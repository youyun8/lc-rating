import { lectureContentMap } from "@/features/lecture/content";
import type { TutorialData } from "@/types";

/**
 * Returns the authored lecture tree for a category. Content now lives in static
 * TypeScript modules (`features/lecture/content`), so this is a synchronous
 * lookup — no runtime fetch of `public/tutorial/*.json` (those files are gone).
 * The `{ isPending, error }` shape is kept for backward compatibility.
 */
export function useTutorial(plan: string) {
  const tutorial = lectureContentMap[plan] as TutorialData.Root | undefined;
  return { tutorial, isPending: false, error: null as Error | null };
}
