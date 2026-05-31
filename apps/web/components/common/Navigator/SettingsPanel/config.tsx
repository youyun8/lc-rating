import {
  BarChart3,
  History,
  List,
  RefreshCw,
  Settings,
  Wrench,
} from "lucide-react";
import CustomizeOptions from "./settingPages/CustomizeOption";
import { Preference } from "./settingPages/Preference";
import ProgressOverview from "./settingPages/ProgressOverview";
import RecentSubmissions from "./settingPages/RecentSubmissions";
import SyncStorage from "./settingPages/SyncStorage";
import { lazy } from "react";

const Troubleshooting = lazy(() => import("./settingPages/Troubleshooting"));

export type SettingTabType = {
  key: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
};

export const settingTabs: SettingTabType[] = [
  {
    key: "SyncProgress",
    title: "帳號與同步",
    icon: <RefreshCw />,
    component: <SyncStorage />,
  },
  {
    key: "CustomizeOptions",
    title: "自訂進度選項",
    icon: <List />,
    component: <CustomizeOptions />,
  },
  {
    key: "Preference",
    title: "頁面偏好設定",
    icon: <Settings />,
    component: <Preference />,
  },
  {
    key: "ProgressOverview",
    title: "進度總覽",
    icon: <BarChart3 />,
    component: <ProgressOverview />,
  },
  {
    key: "RecentSubmissions",
    title: "最近紀錄",
    icon: <History />,
    component: <RecentSubmissions />,
  },
  {
    key: "Troubleshooting",
    title: "故障排除",
    icon: <Wrench />,
    component: <Troubleshooting />,
  },
];
