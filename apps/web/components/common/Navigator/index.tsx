"use client";

import { BILIBILI_0X3F_SPACE, ROUTERS, STUDYPLANS } from "@/config/constants";
import { Code2, Menu, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { GithubBadge } from "./GithubBadge";
import SettingsPanel from "./SettingsPanel";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

/** Only shows the sidebar toggle on study-plan and lecture detail pages. */
function PlanSidebarTrigger() {
  const pathname = usePathname() ?? "";
  const { isMobile, open } = useSidebar();
  const studyPlanSegment = pathname.replace("/studyplan/", "").split("/")[0];
  const lectureSegment = pathname.replace("/lecture/", "").split("/")[0];
  const isDetailPage =
    (pathname.startsWith("/studyplan/") &&
      Boolean(STUDYPLANS[studyPlanSegment as keyof typeof STUDYPLANS])) ||
    (pathname.startsWith("/lecture/") &&
      Boolean(STUDYPLANS[lectureSegment as keyof typeof STUDYPLANS]));

  if (!isDetailPage) return null;

  const shouldShowTrigger = isMobile || !open;

  if (!shouldShowTrigger) return null;

  return <SidebarTrigger />;
}

const navLinks: {
  href: string;
  label: string;
  match: string;
  icon?: LucideIcon;
}[] = [
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
  {
    href: ROUTERS.tutorials.href,
    label: ROUTERS.tutorials.title,
    match: "/lecture",
  },
  {
    href: ROUTERS.handbook.href,
    label: ROUTERS.handbook.title,
    match: "/handbook",
  },
];

const Navigator = React.memo(() => {
  const [show, setShow] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname() ?? "";

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed inset-x-0 top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-primary/30">
      <div className="flex h-[var(--navbar-height)] items-center justify-between gap-3 px-3 sm:px-4">
        {/* Left section */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <PlanSidebarTrigger />

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
            className="group flex min-w-0 items-center gap-2 whitespace-nowrap text-sm font-bold tracking-tight sm:text-base"
          >
            <span
              aria-hidden
              className="brand-gradient inline-flex h-6 w-6 items-center justify-center rounded-lg text-white shadow-sm transition-transform group-hover:scale-105"
            >
              <Code2 className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="text-foreground">LeetCode Rating</span>
          </Link>

          {/* Desktop nav links */}
          <div className="ml-6 hidden items-center gap-1 md:flex">
            {navLinks.map(({ href, label, match, icon: Icon }) => {
              const isActive = pathname.startsWith(match);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[15px] transition-colors ${
                    isActive
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
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
                {navLinks.map(({ href, label, match, icon: Icon }) => {
                  const isActive = pathname.startsWith(match);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-3 text-sm font-normal transition-colors ${
                        isActive
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
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
