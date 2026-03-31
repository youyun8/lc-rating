import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { settingTabs } from "./config";
import Sidebar from "./Sidebar";

interface SettingsPanelProps {
  show: boolean;
  onOpenChange: (show: boolean) => void;
}

export function SettingsPanel({ show, onOpenChange }: SettingsPanelProps) {
  const [activeTab = "", setActiveTab] = useState(settingTabs[0]?.key);

  const ActiveComponent = settingTabs.find(
    (tab) => tab.key === activeTab
  )?.component;

  return (
    <Dialog open={show} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">站點設定</Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>站點設定</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="">
            <Sidebar
              tabs={settingTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          <div className="w-full">
            <div className="p-1 rounded shadow-sm min-h-[300px]">
              {ActiveComponent ? ActiveComponent : "頁面設定錯誤"}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" onClick={() => onOpenChange(false)}>
            關閉
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsPanel;