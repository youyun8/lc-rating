import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useGlobalSettingsStore } from "@/hooks/useGlobalSettings";
import { isThemePreference, ThemePreference } from "@/types/siteStorage";
import { useTheme } from "next-themes";

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "跟隨系統" },
  { value: "light", label: "淺色" },
  { value: "dark", label: "深色" },
];

const Preference = () => {
  const { linkLanguage, toggleLinkLanguage, tagLanguage, toggleTagLanguage } =
    useGlobalSettingsStore();
  const { theme = "system", setTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    if (!isThemePreference(value)) {
      console.error(`[Preference] Invalid theme preference: ${value}`);
      return;
    }

    setTheme(value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="theme-preference">主題</Label>
        <Select value={theme} onValueChange={handleThemeChange}>
          <SelectTrigger id="theme-preference" className="w-[12rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {themeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span>超連結:</span>
        <Label htmlFor="airplane-mode">中文</Label>
        <Switch
          id="airplane-mode"
          checked={linkLanguage !== "zh"}
          onCheckedChange={toggleLinkLanguage}
          className="data-[state=unchecked]:bg-red-400 data-[state=checked]:bg-lime-500"
        />
        <Label htmlFor="airplane-mode">英文</Label>
      </div>
      <div className="flex items-center gap-2">
        <span>標籤:</span>
        <Label htmlFor="airplane-mode">中文</Label>
        <Switch
          id="airplane-mode"
          checked={tagLanguage !== "zh"}
          onCheckedChange={toggleTagLanguage}
          className="data-[state=unchecked]:bg-red-400 data-[state=checked]:bg-lime-500"
        />
        <Label htmlFor="airplane-mode">英文</Label>
      </div>
    </div>
  );
};

Preference.displayName = "Preference";

export { Preference };
