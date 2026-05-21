"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccounts, addAccount } from "@/lib/auth-storage";
import LoginScr from "./screens/login/LoginScr";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (getAccounts().length > 0) router.replace("/home");
  }, [router]);

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      file.text().then((t) => {
        try {
          const data = JSON.parse(t);
          if (!data.tokens || !Array.isArray(data.tokens)) { alert("文件格式错误"); return; }
          let added = 0;
          const existing = getAccounts();
          data.tokens.forEach((t: { token: string; name: string; isMachine?: boolean; remark?: string }) => {
            if (!t.token || !t.name) return;
            if (existing.some((a) => a.token === t.token)) return;
            addAccount(t.token, t.isMachine || false, t.name, t.remark || "");
            added++;
          });
          if (added > 0) router.replace("/account");
        } catch { alert("文件解析失败"); }
      }).catch(() => { console.warn("failed to read import file"); });
    };
    input.click();
  };

  return (
    <div>
      <LoginScr />
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:bottom-6 md:translate-x-0">
        <button
          onClick={handleImport}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 shadow-sm backdrop-blur-md hover:text-gray-700 dark:hover:text-gray-300"
        >
          导入账号
        </button>
      </div>
    </div>
  );
}
