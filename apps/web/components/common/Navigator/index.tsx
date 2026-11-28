"use client";

import { BILIBILI_0X3F_SPACE, ROUTERS, STUDYPLANS } from "@/config/constants";
import {
  BookOpen,
  CalendarRange,
  Gamepad2,
  CircleUser,
  Code2,
  GraduationCap,
  Library,
  Home,
  ListChecks,
  Menu,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { AppearanceMenu } from "./AppearanceMenu";
import { GithubBadge } from "./GithubBadge";
import SettingsPanel from "./SettingsPanel";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { PlayerChip } from "./PlayerChip";

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

interface NavLink {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  icon: LucideIcon;
}

const startsWith = (prefix: string) => (pathname: string) =>
  pathname.startsWith(prefix);

const HOME: NavLink = {
  href: "/",
  label: "今日",
  match: (pathname) => pathname === "/" || pathname === "",
  icon: Home,
};
const QUEST: NavLink = {
  href: ROUTERS.quest.href,
  label: ROUTERS.quest.title,
  match: startsWith("/quest"),
  icon: Gamepad2,
};

/** Learning surfaces, then practice tools. */
const NAV_GROUPS: NavLink[][] = [
  [
    HOME,
    {
      href: ROUTERS.studyPlans.href,
      label: ROUTERS.studyPlans.title,
      match: startsWith("/studyplan"),
      icon: ListChecks,
    },
    QUEST,
    {
      href: ROUTERS.tutorials.href,
      label: ROUTERS.tutorials.title,
      match: startsWith("/lecture"),
      icon: GraduationCap,
    },
    {
      href: ROUTERS.handbook.href,
      label: ROUTERS.handbook.title,
      match: startsWith("/handbook"),
      icon: BookOpen,
    },
    {
      href: ROUTERS.training.href,
      label: ROUTERS.training.title,
      match: startsWith("/training"),
      icon: CalendarRange,
    },
  ],
  [
    {
      href: ROUTERS.problemset.href,
      label: ROUTERS.problemset.title,
      match: startsWith("/problemset"),
      icon: Library,
    },
    {
      href: ROUTERS.contest.href,
      label: ROUTERS.contest.title,
      match: startsWith("/contest"),
      icon: Trophy,
    },
  ],
];

const ACCOUNT: NavLink = {
  href: ROUTERS.account.href,
  label: ROUTERS.account.title,
  match: startsWith("/account"),
  icon: CircleUser,
};

/** Bottom tab bar on phones and tablets: the four places students live. */
const TABS: NavLink[] = [HOME, NAV_GROUPS[0]![1]!, QUEST, NAV_GROUPS[0]![3]!];

function DesktopLink({ link, pathname }: { link: NavLink; pathname: string }) {
  const active = link.match(pathname);
  const isQuest = link === QUEST;
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm transition-colors",
        active
          ? isQuest
            ? "bg-xp text-white shadow-sm"
            : "bg-foreground text-background"
          : isQuest
            ? "font-medium text-xp hover:bg-xp-soft"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {link.label}
    </Link>
  );
}

function MobileTabBar({
  pathname,
  onMore,
  moreOpen,
}: {
  pathname: string;
  onMore: () => void;
  moreOpen: boolean;
}) {
  return (
    <nav
      aria-label="主要分頁"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {TABS.map((link) => {
          const active = link.match(pathname);
          const Icon = link.icon;
          if (link === QUEST) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center"
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "-mt-6 flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-background text-white shadow-lg transition-transform active:scale-95",
                    active ? "bg-xp" : "bg-foreground",
                  )}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span
                  className={cn(
                    "mt-0.5 text-[11px] font-semibold",
                    active ? "text-xp" : "text-muted-foreground",
                  )}
                >
                  {link.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              {link.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          aria-expanded={moreOpen}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
            moreOpen ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <Menu className="h-5 w-5" />
          更多
        </button>
      </div>
    </nav>
  );
}

const Navigator = React.memo(() => {
  const [show, setShow] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname() ?? "";

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const allLinks = [...NAV_GROUPS.flat(), ACCOUNT];

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="flex h-[var(--navbar-height)] items-center justify-between gap-3 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <PlanSidebarTrigger />
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-2 whitespace-nowrap font-bold tracking-tight"
            >
              <span
                aria-hidden
                className="brand-gradient inline-flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-sm transition-transform group-hover:rotate-[-6deg] group-hover:scale-105"
              >
                <Code2 className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <span className="hidden text-foreground sm:inline">
                LeetCode Rating
              </span>
            </Link>

            <div className="ml-4 hidden items-center gap-1 lg:flex">
              {NAV_GROUPS.map((group, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <span className="mx-1.5 h-5 w-px bg-border" aria-hidden />
                  )}
                  {group.map((link) => (
                    <DesktopLink
                      key={link.href}
                      link={link}
                      pathname={pathname}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <PlayerChip />
            <AppearanceMenu />
            <div className="hidden lg:block">
              <SettingsPanel show={show} onOpenChange={setShow} />
            </div>
            <Link
              href={ACCOUNT.href}
              aria-label={ACCOUNT.label}
              title={ACCOUNT.label}
              className={cn(
                "hidden h-9 w-9 items-center justify-center rounded-lg transition-colors lg:flex",
                ACCOUNT.match(pathname)
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <CircleUser className="h-5 w-5" />
            </Link>
            <div className="hidden sm:block">
              <GithubBadge />
            </div>
          </div>
        </div>
      </nav>

      <MobileTabBar
        pathname={pathname}
        moreOpen={mobileMenuOpen}
        onMore={() => setMobileMenuOpen((open) => !open)}
      />

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="關閉選單"
          />
          <div className="fixed inset-x-0 bottom-[calc(var(--mobile-tabbar-height)+env(safe-area-inset-bottom))] z-30 max-h-[75vh] overflow-y-auto rounded-t-3xl border-t border-border/70 bg-background p-4 shadow-2xl lg:hidden">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <div className="grid grid-cols-3 gap-2">
              {allLinks.map((link) => {
                const Icon = link.icon;
                const active = link.match(pathname);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-sm",
                      active
                        ? "border-transparent bg-foreground text-background"
                        : "border-border/70 bg-card",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 rounded-2xl border border-border/60 bg-card p-2 [&_button]:h-10 [&_button]:w-full [&_button]:justify-start">
              <SettingsPanel show={show} onOpenChange={setShow} />
            </div>
            <p className="mt-3 px-1 text-xs leading-relaxed text-muted-foreground">
              本站題解來自{" "}
              <a
                href={BILIBILI_0X3F_SPACE.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-red-700 underline dark:text-red-400"
              >
                {BILIBILI_0X3F_SPACE.title}
              </a>
            </p>
          </div>
        </>
      )}
    </>
  );
});

Navigator.displayName = "Navigator";
export { Navigator };
