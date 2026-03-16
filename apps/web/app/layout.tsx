import { Navigator } from "@/components/common/Navigator";
import { Provider } from "@/components/common/Provider";
import { AuthTokenHandler } from "@/components/common/AuthTokenHandler";
import { FloatingSyncButton } from "@/components/common/FloatingSyncButton";
import { BASE_PATH } from "@/config/constants";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { GlobalStudyPlanSidebar } from "@/components/common/GlobalStudyPlanSidebar";


export const metadata: Metadata = {
  title: "LC-Rating & Training",
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
      <body className={`mt-[var(--navbar-height)] min-h-screen overflow-x-hidden font-song`}>
        <Provider>
          <AuthTokenHandler />
          <SidebarProvider defaultOpen={false}>
            <Navigator />
            <GlobalStudyPlanSidebar />
            <SidebarInset>
              {children}
            </SidebarInset>
            <FloatingSyncButton />
          </SidebarProvider>
        </Provider>
      </body>
    </html>
  );
}
