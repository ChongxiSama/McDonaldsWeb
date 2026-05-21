"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button, Input, Accordion, Surface } from "@heroui/react";
import { RefreshCw, Upload, Trash2, ChevronDown } from "lucide-react";
import { uploadCacheGet, uploadCacheUpload, uploadCacheDel } from "@/lib/mai2link-api";

export default function UploadCachePage({ token, showToast }: { token: string | null; showToast: (m: string) => void }) {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sgw, setSgw] = useState("");
  const [sgwError, setSgwError] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try { const r = await uploadCacheGet({ token }); if (r.success) setItems(r.data); else showToast(r.msg); }
    catch { showToast("获取缓存列表失败"); }
    finally { setLoading(false); }
  }, [token, showToast]);
  const didRun = useRef(false);
  useEffect(() => { if (didRun.current) return; didRun.current = true; load(); }, [load]);
  const handleUploadAll = async () => {
    if (!token) return;
    if (!sgw.trim()) { setSgwError(true); return; }
    setSgwError(false);
    for (const name of items) {
      setUploading(name);
      try { await uploadCacheUpload({ token, indexName: name, SGWCMAID: sgw.trim() }); }
      catch { showToast(`上传 ${name} 失败`); }
    }
    setUploading(null);
    showToast("上传完成");
  };
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input variant="secondary" placeholder="SGWCMAID" value={sgw} onChange={(e) => setSgw(e.target.value)} className="w-full" />
        {sgwError && <div style={{ fontSize: 12, color: "var(--c-danger)", marginTop: 4, fontWeight: 600 }}>SGWCMAID 不能为空</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <Button variant="primary" onPress={load} isDisabled={loading}><RefreshCw size={16} /> 刷新</Button>
          <Button variant="secondary" onPress={handleUploadAll} isDisabled={loading || uploading !== null || items.length === 0}><Upload size={16} /> 全部上传</Button>
        </div>
      </div>
      {loading ? <div style={{ textAlign: "center", padding: 40, color: "var(--c-text-sub)", fontSize: 13 }}>加载中...</div> : items.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "var(--c-text-sub)", fontSize: 13 }}>暂无缓存数据</div> : (
        <Accordion variant="surface">
          {items.map((name) => (
            <Accordion.Item key={name} id={name}>
              <Accordion.Heading>
                <Accordion.Trigger>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "var(--c-text-main)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" isIconOnly onPress={async () => { if (!token) return; if (!sgw.trim()) { setSgwError(true); return; } setUploading(name); try { await uploadCacheUpload({ token, indexName: name, SGWCMAID: sgw.trim() }); showToast("上传成功"); } catch { showToast("上传失败"); } finally { setUploading(null); } }} isDisabled={uploading === name}><Upload size={14} /></Button>
                    <Button size="sm" variant="ghost" isIconOnly onPress={async () => { if (!token) return; try { await uploadCacheDel({ token, indexName: name }); setItems(p => p.filter(i => i !== name)); showToast("已删除"); } catch { showToast("删除失败"); } }}><Trash2 size={14} /></Button>
                  </div>
                  <Accordion.Indicator><ChevronDown size={14} /></Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>
                  <div style={{ fontSize: 12, color: "var(--c-text-mut)", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>{name}</div>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
      <Surface className="mt-4 rounded-2xl p-3 text-sm" style={{ color: "var(--c-info)" }}>
        上传功能需要提供 SGWCMAID。缓存数据上传到服务器后可在机台端下载使用。
      </Surface>
    </div>
  );
}
