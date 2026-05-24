import { Tabs, TabsTrigger } from "@/components/ui/tabs";
import { TabsList } from "@/components/ui-customized/tabs";

import { SettingTabType } from "./config";
import React from "react";

interface SidebarProps {
  tabs: SettingTabType[];
  activeTab?: string | undefined;
  onTabChange: (key: string) => void;
}

const Sidebar = React.memo<SidebarProps>(
  ({ tabs, activeTab, onTabChange }: SidebarProps) => {
    return (
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="flex flex-row lg:flex-col gap-1 sm:gap-2 h-auto flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="w-auto sm:w-full justify-start text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
            >
              <span className="shrink-0">{tab.icon}</span>
              <span className="hidden sm:inline ml-2">{tab.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
