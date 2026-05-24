"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftIcon } from "lucide-react";

interface SidebarVisibilityButtonsProps {
  showLabel?: string;
  hideLabel?: string;
}

export function SidebarVisibilityButtons({
  showLabel = "顯示側欄",
  hideLabel = "隱藏側欄",
}: SidebarVisibilityButtonsProps) {
  const { isMobile, open, openMobile, setOpen, setOpenMobile } = useSidebar();
  const isSidebarVisible = isMobile ? openMobile : open;

  if (!isSidebarVisible) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="border border-border/60 bg-transparent text-muted-foreground hover:bg-accent/70 hover:text-foreground"
        onClick={() => {
          if (isMobile) {
            setOpenMobile(true);
            return;
          }
          setOpen(true);
        }}
      >
        <PanelLeftIcon className="h-4 w-4" />
        {showLabel}
      </Button>
    );
  }

  if (isMobile) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="border border-border/60 bg-transparent text-muted-foreground hover:bg-accent/70 hover:text-foreground"
      onClick={() => setOpen(false)}
    >
      <PanelLeftIcon className="h-4 w-4" />
      {hideLabel}
    </Button>
  );
}
