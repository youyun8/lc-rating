"use client";

import { Button } from "@/components/ui-customized/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BILIBILI_0X3F_SPACE, ROUTERS } from "@/config/constants";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import React from "react";
import { GithubBadge } from "./GithubBadge";
import SettingsPanel from "./SettingsPanel";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navigator = React.memo(() => {
  const { setTheme } = useTheme();
  const [show, setShow] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <NavigationMenu className="px-4 py-3 ring-1 ring-gray-900/10 backdrop-blur-sm dark:shadow-2xl dark:bg-gray-700/15 dark:text-gray-200 dark:ring-black/10 fixed w-full z-10 top-0 max-w-full flex justify-between items-center h-[var(--navbar-height)]">
      {/* Mobile hamburger menu */}
      <div className="md:hidden flex items-center gap-2">
        <SidebarTrigger />
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] pt-12 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left">LeetCode 競賽題目</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <Link
                href={ROUTERS.contest.href}
                className="text-lg font-semibold py-2 px-4 hover:bg-accent rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {ROUTERS.contest.title}
              </Link>
              <Link
                href={ROUTERS.problemset.href}
                className="text-lg font-semibold py-2 px-4 hover:bg-accent rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {ROUTERS.problemset.title}
              </Link>
              <Link
                href={ROUTERS.studyPlans.href}
                className="text-lg font-semibold py-2 px-4 hover:bg-accent rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {ROUTERS.studyPlans.title}
              </Link>
              <div className="flex flex-col gap-2 pl-8">
                {ROUTERS.studyPlans.children.map((plan) => (
                  <Link
                    key={plan.title}
                    href={plan.href}
                    className="text-base py-1 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {plan.title}
                  </Link>
                ))}
              </div>
              <div className="py-2 px-4">
                <SettingsPanel show={show} onOpenChange={setShow} />
              </div>
              <div className="py-2 px-4 text-sm text-muted-foreground">
                <div>本頁面所有題解來自</div>
                <a
                  href={BILIBILI_0X3F_SPACE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-red-700"
                >
                  {BILIBILI_0X3F_SPACE.title}
                </a>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop title */}
      <div className="flex items-center gap-2 hidden md:flex">
        <SidebarTrigger />
        <Link href="/" className="font-bold text-lg hover:text-primary transition-colors">LeetCode 競賽題目</Link>
      </div>

      {/* Desktop navigation */}
      <div className="hidden md:block">
        <NavigationMenuList>
          <NavigationMenuItem>
            <Button
              variant="ghost"
              className="cursor-pointer text-center text-base font-semibold"
            >
              <Link href={ROUTERS.contest.href}>{ROUTERS.contest.title}</Link>
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button
              variant="ghost"
              className="cursor-pointer text-center text-base font-semibold"
            >
              <Link href={ROUTERS.problemset.href}>
                {ROUTERS.problemset.title}
              </Link>
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button
              variant="ghost"
              className="cursor-pointer text-center text-base font-semibold"
            >
              <Link href={ROUTERS.studyPlans.href}>
                {ROUTERS.studyPlans.title}
              </Link>
            </Button>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <SettingsPanel show={show} onOpenChange={setShow} />
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>

      <div className="flex items-center gap-4">
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
    </NavigationMenu>
  );
});

Navigator.displayName = "Navigator";
export { Navigator };
