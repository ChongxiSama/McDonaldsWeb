"use client";

import { memo, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, FileText, Clock, MapPin, Eye, EyeOff, RefreshCw } from "lucide-react";
import CustomMusicQuery from "@/components/custom-music-query";
import ThemeToggle from "@/components/ThemeToggle";

export interface PlaylogItem {
  musicId: number;
  musicTitle?: string;
  level: number;
  achievement: number;
  deluxscore: number;
  totalCombo: number;
  maxCombo: number;
  maxSync: number;
  fastCount: number;
  lateCount: number;
  userPlayDate: string;
  placeName: string;
  placeId?: number;
  isDx?: boolean;
  isClear?: boolean;
  isAchieveNewRecord?: boolean;
  isDeluxscoreNewRecord?: boolean;
  comboStatus?: number;
  syncStatus?: number;
  beforeRating?: number;
  afterRating?: number;
  beforeDeluxRating?: number;
  afterDeluxRating?: number;
  playerNum?: number;
  vsMode?: number;
  vsUserName?: string;
  vsUserRating?: number;
  vsRank?: number;
  isEventMode?: boolean;
  isFreedomMode?: boolean;
  isPlayTutorial?: boolean;
  trackNo?: number;
  tapCriticalPerfect?: number;
  tapPerfect?: number;
  tapGreat?: number;
  tapGood?: number;
  tapMiss?: number;
  holdCriticalPerfect?: number;
  holdPerfect?: number;
  holdGreat?: number;
  holdGood?: number;
  holdMiss?: number;
  slideCriticalPerfect?: number;
  slidePerfect?: number;
  slideGreat?: number;
  slideGood?: number;
  slideMiss?: number;
  touchCriticalPerfect?: number;
  touchPerfect?: number;
  touchGreat?: number;
  touchGood?: number;
  touchMiss?: number;
  breakCriticalPerfect?: number;
  breakPerfect?: number;
  breakGreat?: number;
  breakGood?: number;
  breakMiss?: number;
  isTap?: boolean;
  isHold?: boolean;
  isSlide?: boolean;
  isTouch?: boolean;
  isBreak?: boolean;
  isFastLateDisp?: boolean;
  playCount?: number;
}

interface PlayRecordsViewProps {
  records: PlaylogItem[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  refreshing?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onRefresh: () => void;
}

const DIFF = [
  { abbr: "BAS", grad: "linear-gradient(145deg,#43A047,#2E7D32)", accent: "#4CAF50", shadow: "rgba(76,175,80,0.30)" },
  { abbr: "ADV", grad: "linear-gradient(145deg,#FB8C00,#E65100)", accent: "#FF9800", shadow: "rgba(255,152,0,0.30)" },
  { abbr: "EXP", grad: "linear-gradient(145deg,#E53935,#B71C1C)", accent: "#EF5350", shadow: "rgba(239,83,80,0.30)" },
  { abbr: "MAS", grad: "linear-gradient(145deg,#9C27B0,#6A1B9A)", accent: "#AB47BC", shadow: "rgba(171,71,188,0.30)" },
  { abbr: "REM", grad: "linear-gradient(145deg,#CE93D8,#9C27B0)", accent: "#CE93D8", shadow: "rgba(206,147,216,0.30)" },
] as const;

function toPercent(ach: number): { int: string; dec: string } {
  const v = (ach / 10000).toFixed(4);
  const [int, dec] = v.split(".");
  return { int, dec };
}

function getRank(ach: number): { label: string; color: string; bg: string } {
  const p = ach / 10000;
  if (p >= 100.5) return { label: "SSS+", color: "#92400e", bg: "rgba(234,179,8,0.15)" };
  if (p >= 100.0) return { label: "SSS",  color: "#92400e", bg: "rgba(234,179,8,0.12)" };
  if (p >= 99.5)  return { label: "SS+",  color: "#c2410c", bg: "rgba(249,115,22,0.12)" };
  if (p >= 99.0)  return { label: "SS",   color: "#c2410c", bg: "rgba(249,115,22,0.10)" };
  if (p >= 98.0)  return { label: "S+",   color: "#9a3412", bg: "rgba(255,80,46,0.12)" };
  if (p >= 97.0)  return { label: "S",    color: "#9a3412", bg: "rgba(255,80,46,0.10)" };
  if (p >= 94.0)  return { label: "AAA",  color: "var(--c-text-main)", bg: "rgba(31,41,55,0.07)"  };
  if (p >= 90.0)  return { label: "AA",   color: "var(--c-text-dark)", bg: "rgba(55,65,81,0.07)"  };
  if (p >= 80.0)  return { label: "A",    color: "var(--c-text-main)", bg: "rgba(75,85,99,0.07)"  };
  return               { label: "B-",   color: "var(--c-text-sub)", bg: "rgba(156,163,175,0.07)"};
}

function fmtDate(s: string): string {
  const d = new Date(s);
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${mo}/${da} ${hh}:${mm}`;
}

const FastLateBar = memo(function FastLateBar({ fast, late }: { fast: number; late: number }) {
  const total = fast + late;
  if (total === 0) return null;
  const fastW = Math.round((fast / total) * 100);
  return (
    <div style={fastLateBarStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "var(--font-western)", fontSize: 13, color: "#3B82F6", letterSpacing: 1 }}>
          FAST {fast}
        </span>
        <span style={{ fontFamily: "var(--font-western)", fontSize: 13, color: "#FF502E", letterSpacing: 1 }}>
          LATE {late}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "var(--c-divider)", overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${fastW}%`, background: "linear-gradient(90deg,#60A5FA,#3B82F6)", transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
        <div style={{ flex: 1, background: "linear-gradient(90deg,#FF6B4A,#FF502E)" }} />
      </div>
    </div>
  );
});

const PlaceName = memo(function PlaceName({ name }: { name: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={show
        ? { fontSize: 12, fontWeight: 700, color: "var(--c-text-main)" }
        : { fontFamily: "monospace", letterSpacing: 3, fontSize: 11, color: "var(--c-text-sub)", background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: 5 }
      }>
        {show ? name : "••••••••"}
      </span>
      <button
        onClick={() => setShow(v => !v)}
        style={{ color: "var(--c-text-sub2)", padding: 2, border: "none", background: "none", cursor: "pointer", lineHeight: 0, transition: "color 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--c-text-mut)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--c-text-sub2)")}
      >
        {show ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
    </div>
  );
});

const KpiBox = memo(function KpiBox({ label, children, highlight = false }: { label: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div style={{
      background: "var(--c-surface)",
      border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: 10,
      padding: "10px 8px",
      textAlign: "center",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--c-text-sub2)", marginBottom: 4, letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-western)", fontSize: 16, color: highlight ? "#FF502E" : "var(--c-text-main)", lineHeight: 1 }}>
        {children}
      </div>
    </div>
  );
});

const COMBO_MAP: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "FC", color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  2: { label: "FC+", color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  3: { label: "AP", color: "#ca8a04", bg: "rgba(234,179,8,0.15)" },
  4: { label: "AP+", color: "#ca8a04", bg: "rgba(234,179,8,0.15)" },
};

const SYNC_MAP: Record<number, { label: string; color: string; bg: string }> = {
  5: { label: "SYNC", color: "#2563eb", bg: "rgba(59,130,246,0.15)" },
  1: { label: "FS", color: "#16a34a", bg: "rgba(22,163,74,0.15)" },
  2: { label: "FS+", color: "#16a34a", bg: "rgba(22,163,74,0.15)" },
  3: { label: "FDX", color: "#9333ea", bg: "rgba(147,51,234,0.15)" },
  4: { label: "FDX+", color: "#db2777", bg: "rgba(219,39,119,0.15)" },
};

const fastLateBarStyle = { marginBottom: 14 };
const noteDetailStyle = { marginBottom: 14 };
const pillStyle = { background: "var(--c-surface)", border: "1px solid var(--c-shadow-border-md)", padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: "var(--c-text-sub)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex" as const, alignItems: "center" as const, gap: 5 };
const skeletonStyle = { background: "var(--c-skeleton)", borderRadius: 16, height: 100, animation: "pulse 1.5s ease-in-out infinite" };
const emptyStyle = { textAlign: "center" as const, padding: "60px 0", color: "var(--c-text-sub2)", fontSize: 13 };
const recordCardHeaderStyle = { display: "flex" as const, padding: "13px 13px 13px 11px", gap: 11, cursor: "pointer" as const, userSelect: "none" as const };
const jacketBoxBase = { width: 56, height: 56, flexShrink: 0, borderRadius: 10, overflow: "hidden" as const, position: "relative" as const };
const titleTextStyle = { fontSize: 14, fontWeight: 900, color: "var(--c-text-main)", whiteSpace: "nowrap" as const, overflow: "hidden" as const, textOverflow: "ellipsis", lineHeight: 1.2, flex: 1 };
const diffBadgeStyle = { flexShrink: 0, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, color: "#fff", lineHeight: 1.4 };
const trackBadgeStyle = { flexShrink: 0, fontSize: 9, fontWeight: 700, color: "var(--c-text-sub)", background: "var(--c-bg)", padding: "2px 6px", borderRadius: 4 };
const chevronBoxStyle = { display: "flex" as const, flexDirection: "column" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 4, flexShrink: 0 };
const expandAreaStyle = { padding: 14, background: "var(--c-bg-alt)" };

function jacketUrl(musicId: number): string {
  return `/jacket/UI_Jacket_00${String(musicId % 10000).padStart(4, "0")}.jpg`;
}

const TagPill = memo(function TagPill({ label, c, bg, border }: { label: string; c: string; bg: string; border?: string }) {
  return (
    <span style={{
      fontFamily: "var(--font-western)", fontSize: 10, letterSpacing: 0.3,
      padding: "2px 6px", borderRadius: 4, background: bg, color: c,
      border: border ? `1px solid ${border}` : undefined,
    }}>
      {label}
    </span>
  );
});

const NoteDataView = memo(function NoteDataView({ item }: { item: PlaylogItem }) {
  const notes: { type: string; cp: number; p: number; gr: number; gd: number; ms: number }[] = [];
  if (item.isTap) notes.push({ type: "TAP", cp: item.tapCriticalPerfect ?? 0, p: item.tapPerfect ?? 0, gr: item.tapGreat ?? 0, gd: item.tapGood ?? 0, ms: item.tapMiss ?? 0 });
  if (item.isHold) notes.push({ type: "HOLD", cp: item.holdCriticalPerfect ?? 0, p: item.holdPerfect ?? 0, gr: item.holdGreat ?? 0, gd: item.holdGood ?? 0, ms: item.holdMiss ?? 0 });
  if (item.isSlide) notes.push({ type: "SLIDE", cp: item.slideCriticalPerfect ?? 0, p: item.slidePerfect ?? 0, gr: item.slideGreat ?? 0, gd: item.slideGood ?? 0, ms: item.slideMiss ?? 0 });
  if (item.isTouch) notes.push({ type: "TOUCH", cp: item.touchCriticalPerfect ?? 0, p: item.touchPerfect ?? 0, gr: item.touchGreat ?? 0, gd: item.touchGood ?? 0, ms: item.touchMiss ?? 0 });
  if (item.isBreak) notes.push({ type: "BREAK", cp: item.breakCriticalPerfect ?? 0, p: item.breakPerfect ?? 0, gr: item.breakGreat ?? 0, gd: item.breakGood ?? 0, ms: item.breakMiss ?? 0 });
  if (notes.length === 0) return null;
  return (
    <div style={noteDetailStyle}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-sub2)", marginBottom: 8 }}>判定详情</div>
      {notes.map((n) => (
        <div key={n.type} style={{ display: "grid", gridTemplateColumns: "1fr 5fr", gap: 6, alignItems: "center", marginBottom: 4, fontSize: 12 }}>
          <span style={{ fontWeight: 700, color: "var(--c-text-dark)" }}>{n.type}</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 2, textAlign: "center" }}>
            {[{ l: "CP", v: n.cp, c: "#d97706" }, { l: "P", v: n.p, c: "#ea580c" }, { l: "GR", v: n.gr, c: "#ec4899" }, { l: "GD", v: n.gd, c: "#16a34a" }, { l: "MS", v: n.ms, c: "var(--c-text-mut)" }].map(c => (
              <div key={c.l}>
                <div style={{ fontSize: 9, color: "var(--c-text-sub2)" }}>{c.l}</div>
                <div style={{ fontWeight: 700, color: c.c }}>{c.v}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

const RecordCard = memo(function RecordCard({ item, defaultOpen = false }: { item: PlaylogItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [closing, setClosing] = useState(false);
  const [jacketErr, setJacketErr] = useState(false);
  const handleJacketErr = useCallback(() => setJacketErr(true), []);
  const handleToggle = useCallback(() => { if (open) { setClosing(true); setTimeout(() => { setOpen(false); setClosing(false); }, 200); } else { setOpen(true); } }, [open]);
  const [xmlTitle, setXmlTitle] = useState<string | null>(null);
  const diff = DIFF[Math.min(item.level, 4)];
  const { int, dec } = toPercent(item.achievement);
  const rank = getRank(item.achievement);
  const combo = item.comboStatus != null ? COMBO_MAP[item.comboStatus] : null;
  const sync = item.syncStatus != null ? SYNC_MAP[item.syncStatus] : null;
  const ratingDiff = (item.afterRating ?? 0) - (item.beforeRating ?? 0);

  useEffect(() => {
    let ignore = false;
    const dir = `music${String(item.musicId).padStart(6, "0")}`;
    fetch(`/charts/${dir}/Music.xml`).then(r => r.text()).then(xml => {
      const m = xml.match(/<name[^>]*>[\s\S]*?<str>([^<]+)<\/str>/);
      if (m && !ignore) setXmlTitle(m[1]);
    }).catch(() => {});
    return () => { ignore = true; };
  }, [item.musicId]);

  const title = item.musicTitle || xmlTitle || `TRACK #${item.musicId}`;

  return (
    <div style={{
      background: "var(--c-surface)",
      borderRadius: 16,
      marginBottom: open ? 20 : 10,
      overflow: "hidden",
      border: open
        ? `1px solid ${diff.accent}33`
        : "1px solid var(--c-shadow-border)",
      borderLeft: open ? `3px solid ${diff.accent}` : `1px solid rgba(0,0,0,0.05)`,
      boxShadow: open
        ? `0 8px 24px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.05), 0 0 0 0 ${diff.shadow}`
        : "0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)",
      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
    }}>
      <div
        onClick={handleToggle}
        style={recordCardHeaderStyle}
      >
        <div style={{ ...jacketBoxBase, background: diff.grad, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 6px ${diff.shadow}` }}>
          {!jacketErr && (
            <Image
              src={jacketUrl(item.musicId)}
              alt=""
              fill
              sizes="56px"
              style={{ objectFit: "contain" }}
               onError={handleJacketErr}
            />
          )}
          {jacketErr && (
            <span style={{ fontFamily: "var(--font-western)", fontSize: 14, color: "#fff", lineHeight: "56px", textAlign: "center", display: "block" }}>
              {diff.abbr === "REM" ? "Re:" : diff.abbr}
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <div style={titleTextStyle}>
              {title}
            </div>
            <span style={{ ...diffBadgeStyle, background: diff.grad }}>
              {diff.abbr === "REM" ? "Re:" : diff.abbr}
            </span>
            {item.trackNo != null && (
              <span style={trackBadgeStyle}>
                TRK {item.trackNo}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ fontFamily: "var(--font-western)", fontSize: 22, color: "var(--c-text-main)", lineHeight: 1, display: "flex", alignItems: "baseline", gap: 1 }}>
              {int}<span style={{ fontSize: 12, color: "var(--c-text-sub2)", fontWeight: 400 }}>.{dec}%</span>
            </div>
            {item.isAchieveNewRecord && (
              <span style={{ fontSize: 9, fontWeight: 700, color: "#ca8a04", background: "rgba(202,138,4,0.12)", padding: "1px 5px", borderRadius: 4 }}>NEW</span>
            )}
            <div style={{
              fontFamily: "var(--font-western)", fontSize: 16,
              color: rank.color, background: rank.bg,
              padding: "2px 7px", borderRadius: 6, lineHeight: 1,
            }}>
              {rank.label}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            {item.isClear && <TagPill label="CLEAR" c="#059669" bg="rgba(16,185,129,0.10)" border="rgba(16,185,129,0.18)" />}
            {item.isDx && <TagPill label="DX" c="var(--c-text-sub)" bg="var(--c-bg)" />}
            {combo && <TagPill label={combo.label} c={combo.color} bg={combo.bg} />}
            {sync && <TagPill label={sync.label} c={sync.color} bg={sync.bg} />}
            <span style={{ fontSize: 11, color: "var(--c-text-sub2)" }}>{fmtDate(item.userPlayDate)}</span>
          </div>
        </div>

        <div style={chevronBoxStyle}>
          <ChevronDown
            size={14} color="var(--c-text-sub2)"
            style={{ transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
          {ratingDiff !== 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: ratingDiff > 0 ? "#10B981" : "#EF4444" }}>
              {ratingDiff > 0 ? "+" : ""}{ratingDiff}
            </span>
          )}
        </div>
      </div>

      {(open || closing) && (
        <div
          style={{ borderTop: `1px solid ${diff.accent}22`, ...expandAreaStyle, animation: closing ? "fade-out 0.2s ease-out forwards" : undefined }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
            <KpiBox label="DX Score">
              {item.deluxscore.toLocaleString()}
              {item.totalCombo > 0 && (
                <span style={{ fontSize: 10, color: "var(--c-text-sub2)", fontFamily: "sans-serif" }}> /{(item.totalCombo * 3).toLocaleString()}</span>
              )}
              {item.isDeluxscoreNewRecord && <span style={{ fontSize: 9, color: "#ca8a04", fontWeight: 700, display: "block" }}>NEW</span>}
            </KpiBox>
            <KpiBox label="Max Combo" highlight>
              {item.maxCombo.toLocaleString()}
            </KpiBox>
            <KpiBox label="Max Sync">
              {(item.playerNum ?? 1) <= 1 ? "—" : item.maxSync.toLocaleString()}
            </KpiBox>
            <KpiBox label="Fast + Late">
              {(item.fastCount + item.lateCount).toLocaleString()}
            </KpiBox>
          </div>

          <FastLateBar fast={item.fastCount} late={item.lateCount} />

          <NoteDataView item={item} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--c-text-sub2)", display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={11} /> 游玩时间
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text-dark)" }}>{fmtDate(item.userPlayDate)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--c-text-sub2)", display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={11} /> 游玩店铺
              </span>
              <PlaceName name={item.placeName} />
            </div>
            {item.vsMode != null && item.vsMode > 0 && (
              <div style={{ fontSize: 12, color: "var(--c-text-dark)", background: "rgba(249,115,22,0.08)", borderRadius: 8, padding: "8px 12px" }}>
                对战: {item.vsUserName ? `${item.vsUserName} ` : ""}(Mode {item.vsMode})
              </div>
            )}
            <div style={{ display: "flex", gap: 6 }}>
              {item.isEventMode && <span style={{ fontSize: 11, fontWeight: 700, color: "#9333ea", background: "rgba(147,51,234,0.1)", padding: "2px 8px", borderRadius: 6 }}>活动模式</span>}
              {item.isFreedomMode && <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", background: "rgba(37,99,235,0.1)", padding: "2px 8px", borderRadius: 6 }}>自由模式</span>}
              {item.isPlayTutorial && <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", background: "rgba(22,163,74,0.1)", padding: "2px 8px", borderRadius: 6 }}>教学</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div style={pillStyle}>
      {children}
    </div>
  );
}

export default function PlayRecordsView({
  records, total, page, totalPages, loading, refreshing, onPrev, onNext, onRefresh,
}: PlayRecordsViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="m2l-records-root">
      <div className="app-container">
      <div className="page-header">
        <div className="page-header-title">PLAY RECORDS</div>
        <div style={{ position: "relative" }}>
          <div onClick={() => setMenuOpen(!menuOpen)} className="page-header-avatar">M</div>
          {menuOpen && (
            <div style={{ position: "absolute", top: 42, right: 0, background: "var(--c-surface)", borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", width: 200, zIndex: 100, padding: 16 }} onClick={(e) => e.stopPropagation()}>
              <ThemeToggle />
            </div>
          )}
          {menuOpen && <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setMenuOpen(false)} />}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 100px", scrollbarWidth: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 16px" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <Pill>
              <FileText size={11} />
              总记录:{" "}
              <strong style={{ fontFamily: "var(--font-western)", fontSize: 14, color: "var(--c-text-main)", fontWeight: 400 }}>
                {total}
              </strong>
            </Pill>
            <button
              onClick={onRefresh}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--c-text-sub)", padding: 4,
                animation: refreshing ? "spin 1s linear infinite" : undefined,
              }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <CustomMusicQuery />
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={skeletonStyle} />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div style={emptyStyle}>暂无游玩记录</div>
        ) : (
          records.map((item, i) => (
            <div key={`${item.musicId}-${item.userPlayDate}-${i}`} style={{ animation: `slide-up 0.25s ease-out ${i * 0.04}s both` }}>
              <RecordCard item={item} defaultOpen={i === 0} />
            </div>
          ))
        )}

        {!loading && records.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
            <button
              onClick={onPrev}
              disabled={page === 0}
              style={{
                background: "var(--c-surface)", border: "1px solid var(--c-shadow-border-md)",
                padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13,
                color: page === 0 ? "var(--c-text-sub)" : "var(--c-text-main)",
                boxShadow: page === 0 ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
                cursor: page === 0 ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              ‹ 上一页
            </button>
            <span style={{ fontFamily: "var(--font-western)", fontSize: 15, color: "var(--c-text-sub2)", letterSpacing: 2 }}>
              PAGE {page + 1} / {totalPages || 1}
            </span>
            <button
              onClick={onNext}
              disabled={page >= totalPages - 1}
              style={{
                background: "var(--c-surface)", border: "1px solid var(--c-shadow-border-md)",
                padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13,
                color: page >= totalPages - 1 ? "var(--c-text-sub)" : "var(--c-text-main)",
                boxShadow: page >= totalPages - 1 ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              下一页 ›
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      </div>
    </div>
  );
}