"use client";

import { useRouter, usePathname } from "next/navigation";
import { Grid, Activity, User, Info } from "lucide-react";
import { Tabs } from "@heroui/react";

const TABS = [
  { id: "home", label: "概览", icon: Grid, path: "/home" },
  { id: "records", label: "记录", icon: Activity, path: "/records" },
  { id: "account", label: "账号", icon: User, path: "/account" },
  { id: "about", label: "关于", icon: Info, path: "/about" },
] as const;

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = TABS.find((t) => pathname.startsWith(t.path))?.id || undefined;

  if (!pathname || pathname === "/" || pathname.startsWith("/ctl")) return null;

  return (
    <>
      {/* Mobile: bottom bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-3xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-900/60 px-1 py-1 shadow-xl backdrop-blur-md">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => router.push(`/${key}`)}
          variant="primary"
        >
          <Tabs.ListContainer className="rounded-2xl">
            <Tabs.List className="gap-1 border-none">
              {TABS.map(({ id, label, icon: Icon }) => (
                <Tabs.Tab key={id} id={id} className="whitespace-nowrap px-4 py-2 text-xs font-bold">
                  <Icon size={18} />
                  {label}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      {/* Desktop: top bar */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-50 justify-center pt-6">
        <div className="inline-flex items-center gap-1 rounded-full border border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/70 px-2 py-1.5 shadow-sm backdrop-blur-xl">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => router.push(`/${id}`)}
              className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-all ${
                activeTab === id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
