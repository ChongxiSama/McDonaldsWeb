"use client";

import { useState } from "react";
import { Button, Surface } from "@heroui/react";
import { CheckCircle } from "lucide-react";
import { cacheBackup, cacheBackupAqua, cacheRestore } from "@/lib/mai2link-api";

export default function BackupPage({ token, showToast }: { token: string | null; showToast: (m: string) => void }) {
  const [restoreData, setRestoreData] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const download = async (fn: () => Promise<{ success: boolean; msg: string; data: unknown }>, prefix: string) => {
    if (!token) { showToast("未登录"); return; }
    setBusy(true);
    try {
      const r = await fn();
      if (r.success) {
        const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mai2link-${prefix}-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("下载成功");
      } else showToast(r.msg);
    } catch { showToast("下载失败"); }
    finally { setBusy(false); }
  };
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: "var(--c-text-main)", marginBottom: 12 }}>数据备份</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <Button variant="primary" onPress={() => { if (!token) return; download(() => cacheBackup({ token }), "zundalink-backup"); }} isDisabled={busy || !token}>下载数据缓存</Button>
          <Button variant="secondary" onPress={() => { if (!token) return; download(() => cacheBackupAqua({ token }), "maidata"); }} isDisabled={busy || !token}>下载 AquaDX 格式</Button>
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: "var(--c-text-main)", marginBottom: 12 }}>数据恢复</div>
        <input type="file" accept=".json" style={{ display: "none" }} id="restore-input" onChange={(e) => { const file = e.target.files?.[0]; if (file) { file.text().then(t => { try { setRestoreData(JSON.parse(t)); showToast("备份文件已加载"); } catch { showToast("无效的 JSON 文件"); } }); } }} />
        <label htmlFor="restore-input"><Button variant="secondary" onPress={() => document.getElementById("restore-input")?.click()}>选择备份文件</Button></label>
        {restoreData && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: "var(--c-success)", marginBottom: 8, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={14} /> 备份文件已加载，准备恢复数据</div>
            <Button variant="primary" isDisabled={busy || !token} onPress={async () => { if (!token) return;
              setBusy(true);
              try { const r = await cacheRestore({ token, data: restoreData }); if (r.success) showToast(`共恢复 ${r.count} 条数据`); else showToast(r.msg); }
              catch { showToast("恢复失败"); }
              finally { setBusy(false); }
            }}>恢复数据缓存</Button>
          </div>
        )}
      </div>
      <Surface className="mt-4 rounded-2xl p-3 text-sm" style={{ color: "var(--c-warning)" }}>
        备份文件包含游戏分数、游玩记录、成就进度和设置配置。恢复操作将覆盖当前数据，请谨慎操作。
      </Surface>
    </div>
  );
}
