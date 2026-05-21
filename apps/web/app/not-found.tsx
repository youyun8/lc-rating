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
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-muted-foreground">
        Page not found. Redirecting...
      </p>
    </div>
  );
}
