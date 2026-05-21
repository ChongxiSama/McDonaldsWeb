"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Input, Card } from "@heroui/react";
import { ChevronDown, ChevronUp, Music, X, RefreshCw } from "lucide-react";
import Image from "next/image";

interface MusicData {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  creator: string;
  levels: { label: string; level: string; notes: number; file: string }[];
}

const DIFF_LABELS = ["BAS", "ADV", "EXP", "MAS", "REM"];
const DIFF_COLORS = [
  { label: "BAS", bg: "#2E7D32", text: "#fff" },
  { label: "ADV", bg: "#E65100", text: "#fff" },
  { label: "EXP", bg: "#B71C1C", text: "#fff" },
  { label: "MAS", bg: "#6A1B9A", text: "#fff" },
  { label: "REM", bg: "#9C27B0", text: "#fff" },
];

async function parseMusicXml(xml: string, dir: string): Promise<MusicData | null> {
  const g = (tag: string) => { const m = xml.match(new RegExp(`<${tag}>[\\s\\S]*?<str>([^<]*)<\\/str>`)); return m ? m[1].trim() : ""; };
  const name = g("name") || `ID ${dir.replace("music", "")}`;
  const artist = g("artistName") || g("artist") || "未知";
  const bpm = Number(xml.match(/<bpm>\s*(\d+)\s*<\/bpm>/)?.[1] || 0);
  const id = dir.replace("music", "");
  const levels: MusicData["levels"] = [];
  const noteBlocks = xml.split("<Notes>");
  noteBlocks.slice(1).forEach((block) => {
    const isEnable = block.match(/<isEnable>\s*(true|false)\s*<\/isEnable>/);
    if (isEnable && isEnable[1] !== "true") return;
    const pathMatch = block.match(/<path>\s*([^<]+?)\s*<\/path>/);
    const levelMatch = block.match(/<level>\s*([^<]+?)\s*<\/level>/);
    if (pathMatch && levelMatch) {
      const fn = pathMatch[1];
      const idx = ["_00.", "_01.", "_02.", "_03.", "_04."].findIndex((e) => fn.includes(e));
      if (idx >= 0) {
        levels.push({ label: DIFF_LABELS[idx] || `LV${idx}`, level: levelMatch[1], notes: 0, file: `./charts/${dir}/${fn}` });
      }
    }
  });
  const creator = xml.match(/<notes_music>([^<]+)<\/notes_music>/)?.[1] || "";
  if (levels.length === 0) return null;
  return { id, title: name, artist, bpm, creator, levels };
}

const CACHE_KEY = "mai2link_custom_music";
const CONCURRENCY = 50;

export default function CustomMusicQuery() {
  const [open, setOpen] = useState(false);
  const [musicList, setMusicList] = useState<MusicData[]>(() => {
    try { const c = localStorage.getItem(CACHE_KEY); if (c) { const p = JSON.parse(c); if (Array.isArray(p) && p.length) return p; } } catch {}
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const abortRef = useRef(false);

  useEffect(() => { return () => { abortRef.current = true; }; }, []);

  const load = useCallback(async () => {
    if (loading) return;
    abortRef.current = false;
    setLoading(true);
    setProgress("正在加载...");
    setMusicList([]);

    let ids: string[];
    try {
      const res = await fetch("/charts-manifest.json");
      ids = (await res.json() as string[]).filter(id => {
        const n = Number(id);
        return n >= 16000 && n < 17000;
      });
    } catch {
      setProgress("加载失败");
      if (!abortRef.current) setLoading(false);
      return;
    }

    const found: MusicData[] = [];
    let done = 0;

    for (let i = 0; i < ids.length && !abortRef.current; i += CONCURRENCY) {
      const batch: Promise<void>[] = [];

      for (let j = 0; j < CONCURRENCY && i + j < ids.length; j++) {
        const id = ids[i + j];
        const dir = `music${id}`;

        batch.push(fetch(`/charts/${dir}/Music.xml`).then(async r => {
          done++;
          if (!r.ok) return;
          const xml = await r.text();
          const parsed = await parseMusicXml(xml, dir);
          if (parsed && !abortRef.current) {
            found.push(parsed);
            if (found.length % 5 === 1 || found.length === 1) setMusicList([...found]);
          }
        }).catch(() => {}));
      }

      await Promise.all(batch);
      if (found.length > 0) setMusicList([...found]);
      setProgress(`已加载 ${done}/${ids.length} (已找到 ${found.length} 首)`);
    }

    setMusicList(found);
    if (found.length > 0) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(found)); } catch {}
    }
    setProgress(`共 ${found.length} 首`);
    if (!abortRef.current) setLoading(false);
  }, [loading]);

  useEffect(() => { if (open && musicList.length === 0 && !loading) setTimeout(load, 0); }, [open, load, musicList.length, loading]);

  const filtered = search.trim()
    ? musicList.filter((m) => { const q = search.toLowerCase(); return m.title.toLowerCase().includes(q) || m.id.includes(q) || m.artist.toLowerCase().includes(q) || m.creator.toLowerCase().includes(q); })
    : musicList;

  return (
    <>
      <Button variant="ghost" onPress={() => setOpen(true)} size="sm"><Music size={14} /> 自制铺</Button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl p-4 shadow-xl" style={{ background: "var(--c-surface)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, fontSize: 16, fontWeight: 900, color: "var(--c-text-main)" }}>自制铺</div>
              <Button variant="ghost" isIconOnly size="sm" onPress={load}><RefreshCw size={14} /></Button>
              <Button variant="ghost" isIconOnly size="sm" onPress={() => setOpen(false)}><X size={14} /></Button>
            </div>
            <Input variant="secondary" placeholder="搜索曲名/ID/作者..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-3" />
            <div style={{ fontSize: 12, color: "var(--c-text-sub)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              {loading && <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid var(--c-border)", borderTopColor: "var(--c-orange)", borderRadius: "50%", animation: "_spin 0.6s linear infinite" }} />}
              {progress || `共 ${filtered.length} 首`}
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filtered.map((m) => {
                const isExpanded = expanded === m.id;
                return (
                  <Card key={m.id} className="mb-2">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, cursor: "pointer" }} onClick={() => setExpanded(isExpanded ? null : m.id)}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--c-divider)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        <Image src={`/jacket/UI_Jacket_00${String(Number(m.id) % 10000).padStart(4, "0")}.jpg`} alt="" width={40} height={40} style={{ objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                        <div style={{ fontSize: 11, color: "var(--c-text-sub)" }}>#{m.id} · {m.artist}</div>
                      </div>
                      {isExpanded ? <ChevronUp size={16} style={{ color: "var(--c-text-sub)" }} /> : <ChevronDown size={16} style={{ color: "var(--c-text-sub)" }} />}
                    </div>
                    {isExpanded && (
                      <div style={{ padding: "0 10px 10px", borderTop: "1px solid var(--c-divider)" }}>
                        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                          {DIFF_COLORS.map((d) => {
                            const lv = m.levels.find(l => l.label === d.label);
                            const has = !!lv;
                            return (
                              <button key={d.label} onClick={() => { if (!has) return; const a = document.createElement("a"); a.href = lv!.file; a.download = lv!.file.split("/").pop() || ""; a.click(); }}
                                style={{
                                  flex: 1, padding: "6px 4px", borderRadius: 6, border: "none",
                                  background: has ? d.bg : "var(--c-divider)", fontSize: 11, fontWeight: 700,
                                  cursor: has ? "pointer" : "default", color: has ? d.text : "var(--c-text-sub2)",
                                  textAlign: "center", transition: "opacity 0.15s",
                                }}>
                                {d.label} {has ? `Lv.${lv!.level}` : "-"}
                              </button>
                            );
                          })}
                        </div>
                        {m.creator && <div style={{ fontSize: 11, color: "var(--c-text-sub)", marginTop: 6 }}>谱师: {m.creator}</div>}
                      </div>
                    )}
                  </Card>
                );
              })}
              {!loading && filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: 60, fontSize: 13, color: "var(--c-text-sub)" }}>
                  {musicList.length === 0 ? "暂无数据" : "无匹配结果"}
                </div>
              )}
            </div>
          </div>
          <style>{`@keyframes _spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </>
  );
}
