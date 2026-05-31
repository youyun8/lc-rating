import { useQuery } from "@tanstack/react-query";
import { GithubLogoIcon, StarIcon } from "./GithubIcons";

const GithubBadge = () => {
  const { data } = useQuery<number>({
    queryKey: ["github-stars"],
    queryFn: () =>
      fetch("https://api.github.com/repos/huxulm/lc-rating")
        .then((response) =>
          response.ok ? response.json() : Promise.reject(response.json()),
        )
        .then((data) => data.stargazers_count),
    staleTime: 60 * 1000, // 1 minute
  });

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/60 px-2 py-2 transition-colors hover:bg-accent sm:gap-2 sm:px-2.5"
      href="https://github.com/huxulm/lc-rating"
      aria-label="GitHub repository"
    >
      <GithubLogoIcon className="h-4 w-4 sm:h-5 sm:w-5" />

      <StarIcon className="h-4 w-4 text-gray-300 transition ease-in group-hover:text-yellow-500 sm:h-5 sm:w-5" />

      {data ? <span className="hidden text-sm sm:inline">{data}</span> : null}
    </a>
  );
};

export { GithubBadge };
GithubBadge.DisplayName = "GithubBadge";
