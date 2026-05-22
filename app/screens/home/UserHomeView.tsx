"use client";

import { useState } from "react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { QRCodeSVG } from "qrcode.react";
import { Select, ListBox } from "@heroui/react";
import { Activity, Globe, Eye, EyeOff, Music, Settings as SettingsIcon, Monitor, QrCode, User, Download } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const styleRelative = { position: "relative" as const };
const styleAvatar = { width: 28, height: 28, borderRadius: 8, background: "#111827", color: "#fff", display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, fontSize: 10, fontWeight: 700, flexShrink: 0 };
const styleMenuOverlay = { position: "fixed" as const, inset: 0, zIndex: 99 };
const styleMenuPanel = { position: "absolute" as const, top: 44, right: 0, background: "var(--c-surface)", borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", width: 260, zIndex: 100, padding: 16 };
const styleMenuTitle = { fontSize: 13, fontWeight: 900, color: "var(--c-text-main)", marginBottom: 12 };
const styleMenuEmpty = { fontSize: 12, color: "var(--c-text-sub)", marginBottom: 12 };
const styleDivider = { borderTop: "1px solid var(--c-divider)", marginTop: 12, paddingTop: 12 };
const styleInfoRow = { display: "flex" as const, alignItems: "center" as const, justifyContent: "space-between" as const, marginBottom: 4 };
const styleInfoLabel = { fontSize: 11, color: "var(--c-text-sub)" };
const styleInfoValue = { fontSize: 12, fontWeight: 700, color: "var(--c-text-main)", fontFamily: "var(--font-mono)" };
const styleEyeBtn = { marginTop: 6, fontSize: 11, color: "var(--c-text-sub)", display: "flex" as const, alignItems: "center" as const, gap: 4, border: "none", background: "none", cursor: "pointer" as const, padding: 0 };
const styleAvatarBtn = { width: 36, height: 36, borderRadius: "50%", background: "var(--c-orange)", color: "#fff", display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, fontWeight: 900, cursor: "pointer" as const };
const styleMachineInfo = { flex: 1, minWidth: 0 };
const styleMachineName = { fontSize: 12, fontWeight: 700, color: "var(--c-text-main)" };
const styleMachineCid = { fontSize: 10, color: "var(--c-text-sub)", fontFamily: "var(--font-mono)" };
const styleAccInfoTitle = { fontSize: 13, fontWeight: 900, color: "var(--c-text-main)", marginBottom: 8 };
const stylePageFadeIn = { animation: "page-fade-in 0.3s ease-out" };
const styleCtlLink = { textDecoration: "none", background: "var(--c-orange)" };
const styleWhiteText = { color: "#fff" };
const styleWhiteSubtext = { color: "rgba(255,255,255,0.8)" };
const styleBlackText = { color: "var(--c-black)" };
const styleFlexBetween = { display: "flex" as const, alignItems: "center" as const, justifyContent: "space-between" as const };
const styleArcadeName = { fontSize: 14, fontWeight: 700 };
const styleOnlineSection = { marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--c-divider)", animation: "slide-up 0.2s ease-out" };
const styleOnlineTitle = { fontSize: 11, fontWeight: 700, color: "var(--c-text-mute)", marginBottom: 8 };
const styleNoOnline = { fontSize: 12, color: "var(--c-text-mute)", padding: "8px 0" };
const stylePlayerName = { fontSize: 13, fontWeight: 700, color: "var(--c-text-main)" };
const stylePlayerDuration = { fontSize: 12, color: "var(--c-text-sub)" };
const styleCardHeaderMb = { marginBottom: 8 };
const styleNoRecord = { fontSize: 13, color: "var(--c-text-mut)", padding: "8px 0" };
const styleKeyTitle = { fontSize: 14, fontWeight: 900, marginBottom: 8 };
const styleFlexCenter = { display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const };
const styleLoadingText = { color: "var(--c-text-mut)", fontSize: 13 };
const styleOfflineRow = { display: "flex" as const, alignItems: "center" as const, justifyContent: "space-between" as const, padding: "12px 0", borderTop: "1px solid var(--c-divider)", marginTop: 12 };
const styleRemoteSummary = { fontSize: 12, fontWeight: 700, color: "var(--c-text-mut)", cursor: "pointer" as const, listStyle: "none", display: "flex" as const, alignItems: "center" as const, gap: 4 };
const styleArrow = { fontSize: 10 };
const styleRemoteBody = { marginTop: 8, display: "flex" as const, flexDirection: "column" as const, gap: 8 };
const styleRemoteInput = { height: 36, fontSize: 13 };
const styleRemoteBtn = { background: "var(--c-black)", fontSize: 12, padding: 10 };
const styleCloseBtn = { marginTop: 12 };
const styleSettingItemColumn = { flexDirection: "column" as const, alignItems: "stretch" as const, gap: 8 };
const styleDetails = { marginTop: 8, textAlign: "left" as const };

type UserHomeViewProps = {
  rating: number;
  ratingDelta: number;
  activeRuleCount: number;
  isMachine: boolean;
  arcadeName: string;
  onlinePlayerNames: string[];
  lastHourCount: number;
  onlinePlayers?: Array<{ userName: string; loginTime: string; playDuration: number; playDurationFormatted: string }>;
  recentPlayRecords?: Array<{ userName: string; loginTime: string; logoutTime: string; durationFormatted: string }>;
  lastRecord: { title: string; dxScore: number; totalDxScore: number; achievement: number; rank: string } | null;
  qrAccessCode: string;
  machines: { name: string; cid: string }[];
  m2lId: string;
  userId: string;
  settingFixLoginState: boolean;
  settingUnlockMusic: boolean;
  settingUserName: string;
  onToggleOffline: () => void;
  onToggleUnlockMusic: (key: string) => void;
  onChangeUserName: (name: string) => void;
};

const M2L_QR_PREFIX = "MAID2512311145144D41493250524F5859FFFFFFFFFFFFFFFFFFFFFFFFFF";

function makeQRData(code: string): string {
  const now = new Date();
  const ft = new Date(now.getTime() + 10 * 60 * 1000);
  const ts = `${String(ft.getFullYear()).slice(-2)}${String(ft.getMonth() + 1).padStart(2, "0")}${String(ft.getDate()).padStart(2, "0")}${String(ft.getHours()).padStart(2, "0")}${String(ft.getMinutes()).padStart(2, "0")}${String(ft.getSeconds()).padStart(2, "0")}`;
  return `SGWC${M2L_QR_PREFIX}${code}${ts}`;
}

export default function UserHomeView({
  rating, ratingDelta, activeRuleCount, isMachine, arcadeName,
  onlinePlayerNames, lastHourCount, onlinePlayers, recentPlayRecords, lastRecord, qrAccessCode,
  machines, m2lId, userId,
  settingFixLoginState, settingUnlockMusic, settingUserName,
  onToggleOffline, onToggleUnlockMusic, onChangeUserName,
}: UserHomeViewProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const [qrClosing, setQrClosing] = useState(false);
  const [arcadeRevealed, setArcadeRevealed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [uidRevealed, setUidRevealed] = useState(false);
  const [unlockKey, setUnlockKey] = useState("");
  const [keyModal, setKeyModal] = useState(false);
  const [remoteSgw, setRemoteSgw] = useState("");
  const [remoteCid, setRemoteCid] = useState("");
  const [remoteCidName, setRemoteCidName] = useState("");
  const [remoteMsg, setRemoteMsg] = useState("");
  const [remoteOk, setRemoteOk] = useState(false);
  const [show155, setShow155] = useState(false);

  const closeQr = () => { setQrClosing(true); setTimeout(() => { setQrOpen(false); setQrClosing(false); }, 200); };

  return (
    <div className="m2l-user-root">
      <div className="app-container">
        <div className="top-nav">
          <div className="page-header-title">OVERVIEW</div>
          <div style={styleRelative}>
            <div onClick={() => setMenuOpen(!menuOpen)} style={styleAvatarBtn}>M</div>
            {menuOpen && (
              <div style={styleMenuPanel} onClick={(e) => e.stopPropagation()}>
                <div style={styleMenuTitle}>已绑定机台</div>
                {machines.length === 0 ? (
                  <div style={styleMenuEmpty}>暂无绑定机台</div>
                ) : (
                  machines.map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < machines.length - 1 ? "1px solid var(--c-divider)" : "none" }}>
                      <div style={styleAvatar}>M</div>
                      <div style={styleMachineInfo}>
                        <div style={styleMachineName}>{m.name || "未命名机台"}</div>
                        <div style={styleMachineCid}>{m.cid}</div>
                      </div>
                    </div>
                  ))
                )}
                <div style={styleDivider}>
                  <div style={styleAccInfoTitle}>账号信息</div>
                  {m2lId && (
                    <div style={styleInfoRow}>
                      <span style={styleInfoLabel}>M2L UID</span>
                      <span style={styleInfoValue}>
                        {uidRevealed ? m2lId : m2lId.length > 2 ? m2lId.slice(0, 2) + "••" : m2lId}
                      </span>
                    </div>
                  )}
                  {userId && (
                    <div style={styleInfoRow}>
                      <span style={styleInfoLabel}>舞萌 UID</span>
                      <span style={styleInfoValue}>
                        {uidRevealed ? userId : userId.length > 2 ? userId.slice(0, 2) + "••" : userId}
                      </span>
                    </div>
                  )}
                  <button onClick={() => setUidRevealed(!uidRevealed)} style={styleEyeBtn}>
                    {uidRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                    {uidRevealed ? "隐藏" : "显示全部"}
                  </button>
                </div>
                <div style={styleDivider}><ThemeToggle /></div>
              </div>
            )}
            {menuOpen && <div style={styleMenuOverlay} onClick={() => setMenuOpen(false)} />}
          </div>
        </div>

        <div className="view-content" style={stylePageFadeIn}>
          <div className="rating-card">
            <Activity className="rating-bg-icon" size={160} />
            <div className="rating-label">
              <Activity size={16} />
              DX RATING
            </div>
            <div className="rating-val">{rating.toLocaleString()}</div>
            <div className="rating-trend">
              {ratingDelta > 0 ? `↑ +${ratingDelta}` : ratingDelta < 0 ? `↓ ${ratingDelta}` : "±0"} Today
            </div>
          </div>

          <div className="grid-2">
            <div className="action-card" onClick={() => setQrOpen(true)}>
              <div className="ac-icon">
                <QrCode size={28} />
              </div>
              <div>
                <div className="ac-title">登录凭据</div>
                <div className="ac-sub">点击查看二维码</div>
              </div>
            </div>

            {isMachine ? (
              <Link href="/ctl" className="action-card" style={styleCtlLink}>
                <div className="ac-icon" style={styleWhiteText}>
                  <Monitor size={28} />
                </div>
                <div>
                  <div className="ac-val" style={styleWhiteText}>CTL</div>
                  <div className="ac-label" style={styleWhiteSubtext}>机台控制面板</div>
                </div>
              </Link>
            ) : (
              <div className="action-card">
                <div className="ac-icon" style={styleBlackText}>
                  <Activity size={28} />
                </div>
                <div>
                  <div className="ac-val">{activeRuleCount}</div>
                  <div className="ac-label">活跃转发规则数</div>
                </div>
              </div>
            )}
          </div>

          <div className="card overflow-hidden">
            <button
              onClick={() => setShow155(true)}
              className="w-full flex items-center gap-2 px-4 py-3 mb-4 rounded-xl border border-orange-300 dark:border-orange-700 bg-orange-100/60 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 font-bold text-xs hover:bg-orange-200/60 dark:hover:bg-orange-800/40 transition-colors cursor-pointer"
            >
              <Download size={16} />
              点击下载1.55
            </button>

            {show155 && (
              <div
                className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShow155(false)}
              >
                <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                  <video src="/download155.mp4" autoPlay controls loop className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" />
                </div>
              </div>
            )}

            <div className="card-header">
              <div className="card-title">
                <Globe size={16} />
                机厅实时在线
              </div>

            </div>

            <div style={styleFlexBetween}>
              <div style={styleArcadeName}>
                <span className={`sensitive-text ${arcadeRevealed ? "revealed" : ""}`}>
                  {arcadeRevealed ? arcadeName : "********"}
                </span>
              </div>
              <button className="eye-btn" onClick={() => setArcadeRevealed((v) => !v)}>
                {arcadeRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="realtime-stats">
              <div className="rs-item">
                <div className="rs-val" style={{ color: onlinePlayerNames.length > 0 ? "var(--c-green)" : "var(--c-text-sub)" }}>
                  {onlinePlayerNames.length > 0 ? "有人" : "空闲"}
                </div>
                <div className="rs-label">机台状态</div>
              </div>
              <div className="rs-item">
                <div className="rs-val">{lastHourCount} <span className="unit">次</span></div>
                <div className="rs-label">近一小时总会话数</div>
              </div>
            </div>

            <div style={styleOnlineSection}>
              <div>
                <div style={styleOnlineTitle}>当前上机玩家</div>
                {(onlinePlayers ?? []).length === 0 ? (
                  <div style={styleNoOnline}>暂无玩家在线</div>
                ) : (
                  (onlinePlayers ?? []).slice(0, 5).map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < Math.min((onlinePlayers ?? []).length, 5) - 1 ? "1px solid var(--c-divider)" : "none" }}>
                      <span style={stylePlayerName}>{p.userName}</span>
                      <span style={stylePlayerDuration}>{p.playDurationFormatted}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={styleOnlineSection}>
              <div>
                <div style={styleOnlineTitle}>最近游玩的玩家</div>
                {(recentPlayRecords ?? []).length === 0 ? (
                  <div style={styleNoOnline}>暂无记录</div>
                ) : (
                  <div style={{ maxHeight: 200, overflowY: "auto", scrollbarWidth: "none" }}>
                    {(recentPlayRecords ?? []).map((r, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < (recentPlayRecords ?? []).length - 1 ? "1px solid var(--c-divider)" : "none" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={stylePlayerName}>{r.userName}</div>
                          <div style={{ fontSize: 10, color: "var(--c-text-sub)", marginTop: 2 }}>
                            {r.loginTime ? (() => { const d = new Date(r.loginTime); return `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; })() : ""}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--c-text-sub)", flexShrink: 0 }}>{r.durationFormatted}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={styleCardHeaderMb}>
              <div className="card-title">
                <Music size={16} />
                最近一次游玩记录
              </div>
            </div>
            {lastRecord ? (
              <div className="score-row">
                <div>
                  <div className="track-name">{lastRecord.title}</div>
                  <div className="score-detail">DX SCORE: {lastRecord.dxScore.toLocaleString()} / {lastRecord.totalDxScore.toLocaleString()}</div>
                </div>
                <div className="score-result">
                  <div className="score-pct">{lastRecord.achievement.toFixed(2)}%</div>
                  <div className="score-rank">RANK {lastRecord.rank}</div>
                </div>
              </div>
            ) : (
              <div style={styleNoRecord}>暂无游玩记录</div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <SettingsIcon size={16} />
                快速设置
              </div>
            </div>

            <div className="setting-item">
              <div className="si-info">
                <div className="si-icon">
                  <Music size={18} />
                </div>
                <div className="si-text">最新最热乐曲解锁</div>
              </div>
              <Switch checked={settingUnlockMusic} onCheckedChange={(v) => { if (!v) { onToggleUnlockMusic(""); } else { setUnlockKey(""); setKeyModal(true); } }} />
            </div>
            {keyModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setKeyModal(false)}>
                <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                  <div style={styleKeyTitle}>输入公钥</div>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500" value={unlockKey} onChange={(e) => setUnlockKey(e.target.value)} placeholder="请输入公钥" autoFocus />
                  <button className="w-full mt-3 bg-orange-500 text-white rounded-xl py-3 font-bold text-sm" onClick={() => { setKeyModal(false); onToggleUnlockMusic(unlockKey); }}>确认</button>
                </div>
              </div>
            )}
            <div className="setting-item" style={styleSettingItemColumn}>
<div style={styleFlexBetween}>
                <div className="si-info">
                  <div className="si-icon"><User size={18} /></div>
                  <div className="si-text">修改用户名</div>
                </div>
                <Switch checked={!!settingUserName} onCheckedChange={(v) => onChangeUserName(v ? "Mai2Link" : "")} />
              </div>
              {!!settingUserName && <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 font-mono" value={settingUserName} onChange={(e) => onChangeUserName(e.target.value)} />}
            </div>
          </div>
        </div>

        {(qrOpen || qrClosing) && (
          <div className="modal-overlay" style={{ animation: qrClosing ? "modal-backdrop-out 0.2s ease-out forwards" : "modal-backdrop 0.2s ease-out" }} onClick={closeQr}>
            <div className="modal-box" style={{ animation: qrClosing ? "modal-content-out 0.2s ease-out forwards" : "modal-content 0.25s cubic-bezier(0.34,1.56,0.64,1)" }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">ACCESS CREDENTIALS</div>
              <div className="modal-sub">扫码或输入访问码进行登录</div>
              <div className="qr-placeholder" style={styleFlexCenter}>
                {qrAccessCode ? (
                  <QRCodeSVG value={makeQRData(qrAccessCode)} size={160} />
                ) : (
                  <span style={styleLoadingText}>加载中...</span>
                )}
              </div>
              <div className="access-code">{qrAccessCode || "-"}</div>

              <div style={styleOfflineRow}>
                <span style={stylePlayerName}>离线登录</span>
                <Switch checked={settingFixLoginState} onCheckedChange={onToggleOffline} />
              </div>

              <details style={styleDetails}>
                <summary style={styleRemoteSummary}>
                  <span style={styleArrow}>▶</span> 远程登录
                </summary>
                <div style={styleRemoteBody}>
                  <input className="mai-input" style={styleRemoteInput} placeholder="SGWCMAID" value={remoteSgw} onChange={(e) => setRemoteSgw(e.target.value)} />
                  <Select variant="secondary" placeholder="选择机台" value={remoteCidName || null} onChange={(v) => { const s = String(v || ""); setRemoteCidName(s); const m = machines.find((x) => x.name === s || x.cid === s); setRemoteCid(m?.cid || s); }}>
                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {machines.map((m, i) => <ListBox.Item key={String(i)} id={m.name || m.cid}>{m.name || m.cid}</ListBox.Item>)}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {remoteMsg && (
                    <div style={{ fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 8, background: remoteOk ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: remoteOk ? "var(--c-success)" : "var(--c-danger)" }}>
                      {remoteMsg}
                    </div>
                  )}
                  <button className="modal-close-btn" style={styleRemoteBtn} onClick={async () => {
                    if (!remoteSgw.trim() || !remoteCid.trim()) { setRemoteMsg("请填写完整信息"); setRemoteOk(false); return; }
                    try {
                      const { aimeDBRegToken } = await import("@/lib/mai2link-api");
                      const res = await aimeDBRegToken({ SGWCMAID: remoteSgw.trim(), clientId: remoteCid.trim(), token: qrAccessCode || "", cf_token: "" });
                      setRemoteMsg(res.success ? "远程登录成功" : (res.msg || "失败"));
                      setRemoteOk(res.success);
                    } catch { setRemoteMsg("连接失败"); setRemoteOk(false); }
                  }}>发送远程登录</button>
                </div>
              </details>

              <button className="modal-close-btn" style={styleCloseBtn} onClick={closeQr}>关闭</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}