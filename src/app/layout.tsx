import { ReactNode } from "react";

import { Inter, Roboto_Mono } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";
import TopBar from "./topbar";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"]
});

const roboto_mono = Roboto_Mono({
  variable: "--font-roboto-mono",
  display: "swap",
  subsets: ["latin"]
});

export const metadata = {
  title: "Interview Prepper",
  openGraph: {
    title: "Interview Prepper",
    description: "Interview Prepper is a open source tool to help you prepare for your next interview."
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable}`}>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}

      <body className={"bg-black/60"}>
        <TopBar />
        <main>
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
