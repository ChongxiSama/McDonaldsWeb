import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/ui/bottomNav";
import SwRegister from "./sw-register";
import ClientShell from "./client-shell";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "Mai2Link - 舞萌DX 数据转发服务平台",
    template: "%s - Mai2Link",
  },
  description:
    "Mai2Link 是舞萌DX（CHUNITHM）的机台数据转发与管理平台，支持 AIME 绑定、转发规则配置、云备份、游玩记录查询等。",
  keywords: ["舞萌DX", "Mai2Link", "中二节奏", "CHUNITHM", "AIME", "机台控制", "舞萌", "数据转发"],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Mai2Link" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Mai2Link",
    title: "Mai2Link - 舞萌DX 数据转发服务平台",
    description:
      "Mai2Link 是舞萌DX 的机台数据转发与管理平台，支持 AIME 绑定、转发规则配置、云备份、游玩记录查询等功能。",
    url: "https://mai.chongxi.us/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mai2Link - 舞萌DX 数据转发服务平台",
    description:
      "Mai2Link 是舞萌DX 的机台数据转发与管理平台。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#FF502E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <style>{`html { background-color: #F4F5F7; } html.dark { background-color: #0D1117; }`}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="h-full flex flex-col pb-20" style={{ fontFamily: "var(--font-cn)" }}>
        <ThemeProvider>
          <ClientShell>{children}</ClientShell>
          <BottomNav />
          <SwRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
