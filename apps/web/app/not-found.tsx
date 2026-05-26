"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BASE_PATH } from "@/config/constants";

// List of known routes that should have trailing slashes
const KNOWN_ROUTES = [
  "/contest",
  "/problemset",
  "/search",
  "/studyplan",
  "/lecture",
];

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Remove base path from pathname for route matching
    const normalizedPath = pathname.startsWith(BASE_PATH)
      ? pathname.slice(BASE_PATH.length)
      : pathname;

    // Check if the current path (without trailing slash) matches a known route
    const pathWithoutTrailingSlash = normalizedPath.replace(/\/$/, "");

    if (KNOWN_ROUTES.includes(pathWithoutTrailingSlash)) {
      // Redirect to the same path with trailing slash
      const redirectPath = BASE_PATH + pathWithoutTrailingSlash + "/";
      window.location.href = redirectPath;
    }
  }, [pathname, router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6 sm:p-10">
      <section className="brand-glow motion-rise relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/60 bg-background/80 p-8 text-center shadow-[0_30px_80px_-50px_rgba(168,83,186,0.55)] sm:p-12">
        <p className="brand-text-gradient text-7xl font-extrabold tracking-tight sm:text-8xl">
          404
        </p>
        <h1 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
          頁面不存在
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Page not found. Redirecting...
        </p>
      </section>
    </div>
  );
}
