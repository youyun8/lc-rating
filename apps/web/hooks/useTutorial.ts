import type { TutorialData } from "@/types";
import { fetchApi } from "@/utils/fetch";
import { useQuery } from "@tanstack/react-query";

export function useTutorial(plan: string) {
  const {
    data: tutorial,
    isPending,
    error,
  } = useQuery<TutorialData.Root>({
    queryKey: [`tutorial/${plan}`],
    queryFn: () =>
      fetchApi(
        `/tutorial/${plan}.json?t=${(new Date().getTime() / 100000).toFixed(
          0,
        )}`,
        { cache: "no-store" },
      ).then((res) => res.json()),
    staleTime: 0,
  });

  return { tutorial, isPending, error };
}
