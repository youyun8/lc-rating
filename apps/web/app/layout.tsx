import { Navigator } from "@/components/common/Navigator";
import { Provider } from "@/components/common/Provider";
import { AuthTokenHandler } from "@/components/common/AuthTokenHandler";
import { AutoSync } from "@/components/common/AutoSync";
import { BASE_PATH } from "@/config/constants";
import type { Metadata, Viewport } from "next";
import { Ubuntu_Sans_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { GlobalStudyPlanSidebar } from "@/components/common/GlobalStudyPlanSidebar";

const ubuntuSansMono = Ubuntu_Sans_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-ubuntu-sans-mono",
});

export const metadata: Metadata = {
  title: "LeetCode Rating",
  icons: `${BASE_PATH}/favico.svg`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${ubuntuSansMono.variable} mt-[var(--navbar-height)] min-h-screen overflow-x-hidden font-song`}
      >
        <Provider>
          <AuthTokenHandler />
          <AutoSync />
          <SidebarProvider defaultOpen={false}>
            <Navigator />
            <GlobalStudyPlanSidebar />
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </Provider>
      </body>
    </html>
  );
}
