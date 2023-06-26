import "@/styles/globals.css";

import { Suspense } from "react";
import { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { fontMono, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import ReactQueryProvider from "@/providers/react-query-provider";
import ThemeProvider from "@/providers/theme-provider";
import { TailwindIndicator } from "@/app/components/tailwind-indicator";
import { SiteHeader } from "@/app/components/topbar/site-header";
import Loading from "@/app/loading";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
            fontMono.variable
          )}
        >
          <Suspense fallback={<Loading />}>
            <ReactQueryProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <div className="relative flex min-h-screen flex-col">
                  <SiteHeader />
                  <div className="flex-1">{children}</div>
                </div>
                <TailwindIndicator />
              </ThemeProvider>
            </ReactQueryProvider>
          </Suspense>
        </body>
      </html>
    </>
  );
}
