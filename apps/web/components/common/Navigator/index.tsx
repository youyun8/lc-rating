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
  { href: ROUTERS.contest.href, label: ROUTERS.contest.title, match: "/contest" },
  { href: ROUTERS.problemset.href, label: ROUTERS.problemset.title, match: "/problemset" },
  { href: ROUTERS.studyPlans.href, label: ROUTERS.studyPlans.title, match: "/studyplan" },
];

const Navigator = React.memo(() => {
  const { setTheme } = useTheme();
  const [show, setShow] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed top-0 w-full z-10 h-[var(--navbar-height)] border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center gap-2">
          <StudyPlanSidebarTrigger />

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Open menu</span>
          </button>

          {/* Logo */}
          <Link href="/" className="font-bold text-base hover:text-primary transition-colors whitespace-nowrap">
            LeetCode Rating
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center ml-6 gap-1 h-full">
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
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <SettingsPanel show={show} onOpenChange={setShow} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const currentTheme =
                document.documentElement.classList.contains("dark") ? "dark" : "light";
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
        <div className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-md shadow-lg">
          <div className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map(({ href, label, match }) => {
              const isActive = pathname.startsWith(match);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-border/60 mt-2">
              <SettingsPanel show={show} onOpenChange={setShow} />
            </div>
            <div className="px-3 py-2 text-xs text-muted-foreground">
              <span>本頁面所有題解來自 </span>
              <a
                href={BILIBILI_0X3F_SPACE.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-red-700"
              >
                {BILIBILI_0X3F_SPACE.title}
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

Navigator.displayName = "Navigator";
export { Navigator };
