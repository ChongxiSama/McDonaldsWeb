"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button, Card, Surface } from "@heroui/react";
import { Camera } from "lucide-react";
import { photoGet, photoGetFile, photoDelFile } from "@/lib/mai2link-api";

export default function PhotosPage({ token, showToast }: { token: string | null; showToast: (m: string) => void }) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try { const r = await photoGet({ token }); if (r.success) setFiles(r.fileList); else showToast(r.msg); }
    catch { showToast("获取相片列表失败"); }
    finally { setLoading(false); }
  }, [token, showToast]);
  const didRun = useRef(false);
  useEffect(() => { if (didRun.current) return; didRun.current = true; load(); }, [load]);
  const viewPhoto = async (name: string) => {
    if (!token) return;
    try { const blob = await photoGetFile({ token, fileName: name }); setPreviewUrl(URL.createObjectURL(blob)); setPreview(name); }
    catch { showToast("加载相片失败"); }
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Button variant="primary" onPress={load} isDisabled={loading}>刷新</Button>
        {preview && <Button variant="ghost" onPress={() => { setPreview(null); setPreviewUrl(null); }}>关闭预览</Button>}
      </div>
      {loading ? <div style={{ textAlign: "center", padding: 40, color: "var(--c-text-sub)", fontSize: 13 }}>加载中...</div> : files.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "var(--c-text-sub)", fontSize: 13 }}>暂无相片</div> : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {files.map((name) => (
          <Card key={name} className="overflow-hidden">
            <div style={{ aspectRatio: "16/9", background: "var(--c-divider)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => viewPhoto(name)}><Camera size={32} style={{ color: "var(--c-text-sub)" }} /></div>
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 6 }}>{name}</div>
              <Button size="sm" variant="ghost" className="w-full" onPress={() => viewPhoto(name)}>查看</Button>
            </div>
          </Card>
        ))}
      </div>}
      {preview && previewUrl && (
        <Surface className="mt-4 overflow-hidden">
          <Image src={previewUrl} alt="" width={0} height={0} sizes="100vw" style={{ width: "100%", height: "auto", display: "block" }} />
          <div style={{ display: "flex", gap: 8, padding: 10 }}>
            <Button size="sm" variant="primary" onPress={() => { const a = document.createElement("a"); a.href = previewUrl; a.download = preview; a.click(); }}>下载</Button>
            <Button size="sm" variant="danger" onPress={async () => { if (!token) return; try { await photoDelFile({ token, fileName: preview }); setFiles(p => p.filter(f => f !== preview)); setPreview(null); setPreviewUrl(null); showToast("已删除"); } catch { showToast("删除失败"); } }}>删除</Button>
          </div>
        </Surface>
      )}
    </div>
  );
}
