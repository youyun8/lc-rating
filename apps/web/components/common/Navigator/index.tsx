"use client";

import { Button } from "@/components/ui-customized/button";
import { BILIBILI_0X3F_SPACE, ROUTERS } from "@/config/constants";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { GithubBadge } from "./GithubBadge";
import SettingsPanel from "./SettingsPanel";
import { SidebarTrigger } from "@/components/ui/sidebar";

/** Only shows the sidebar toggle on study-plan detail pages. */
function StudyPlanSidebarTrigger() {
  const pathname = usePathname() ?? "";
  const isDetailPage =
    pathname.startsWith("/studyplan/") &&
    (pathname.replace("/studyplan/", "").split("/")[0] ?? "").length > 0;

  if (!isDetailPage) return null;
  return <SidebarTrigger />;
}

const navLinks = [
  {
    href: ROUTERS.contest.href,
    label: ROUTERS.contest.title,
    match: "/contest",
  },
  {
    href: ROUTERS.problemset.href,
    label: ROUTERS.problemset.title,
    match: "/problemset",
  },
  {
    href: ROUTERS.studyPlans.href,
    label: ROUTERS.studyPlans.title,
    match: "/studyplan",
  },
];

const Navigator = React.memo(() => {
  const { setTheme } = useTheme();
  const [show, setShow] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname() ?? "";

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed inset-x-0 top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="flex h-[var(--navbar-height)] items-center justify-between gap-3 px-3 sm:px-4">
        {/* Left section */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <StudyPlanSidebarTrigger />

          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-lg p-2 transition-colors hover:bg-accent md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="min-w-0 whitespace-nowrap text-sm font-bold transition-colors hover:text-primary sm:text-base"
          >
            <span className="sm:hidden">LeetCode Rating</span>
            <span className="hidden sm:inline">LeetCode Rating</span>
          </Link>

          {/* Desktop nav links */}
          <div className="ml-6 hidden h-full items-center gap-1 md:flex">
            {navLinks.map(({ href, label, match }) => {
              const isActive = pathname.startsWith(match);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center h-full px-3 text-base font-semibold transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden md:block">
            <SettingsPanel show={show} onOpenChange={setShow} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10"
            onClick={() => {
              const currentTheme = document.documentElement.classList.contains(
                "dark",
              )
                ? "dark"
                : "light";
              setTheme(currentTheme === "light" ? "dark" : "light");
            }}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <GithubBadge />
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-[var(--navbar-height)] bg-black/20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 top-full border-b border-border/60 bg-background/95 shadow-xl backdrop-blur-md md:hidden">
            <div className="flex flex-col gap-4 px-4 py-4">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-1.5">
                {navLinks.map(({ href, label, match }) => {
                  const isActive = pathname.startsWith(match);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-border/60 bg-background p-2 [&_button]:h-10 [&_button]:w-full [&_button]:justify-start">
                <SettingsPanel show={show} onOpenChange={setShow} />
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/20 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                <span>本頁面所有題解來自 </span>
                <a
                  href={BILIBILI_0X3F_SPACE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-red-700 underline dark:text-red-400"
                >
                  {BILIBILI_0X3F_SPACE.title}
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
});

Navigator.displayName = "Navigator";
export { Navigator };
