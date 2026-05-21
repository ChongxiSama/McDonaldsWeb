"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Ban,
  Bird,
  Camera,
ChevronRight,
  ChevronLeft,
  ClipboardList,
  Clock3,
  Coins,
  Cpu,
  Eye,
  EyeOff,
  FilePenLine,
  Flame,
  FlaskConical,
  FolderTree,
  Gamepad2,
  Globe,
  HardDrive,
  MessageSquare,
  Monitor,
  Music2,
  Package,
  Palette,
  PartyPopper,
  Power,
  RefreshCw,
  Settings,
  Timer,
  Trash2,
  Volume2,
  Zap,
} from "lucide-react";
import { getAuthCookie } from "../lib/auth-cookie";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import ThemeToggle from "@/components/ThemeToggle";
import { AlertDialog, Button, useOverlayState } from "@heroui/react";
import {
  execM2lctlOp,
  getHostsMai2Link,
  getM2lctlHealthMai2Link,
  getM2lctlScreenshotMai2Link,
  setHostsMai2Link,
  m2lCtlIPCConfigGet,
  type M2lctlHealth,
} from "../lib/mai2link-api";

type AuthState = { token: string; isMachine: boolean } | null;
type CtlModalType = "none" | "volume" | "noteSize" | "gameMsg" | "sideloadCoin" | "hosts" | "sideload" | "rateLimit" | "easterEgg" | "orderBlacklist" | "orderRemoveList" | "judgeMode";

const FALLBACK_ORDER_NAMES = ["MSDATA", "SDGB150", "SDEZ165", "SDEZ160", "SDGB140", "SDGB130", "MajdataPlay", "Tools"];

const SIDELOAD_VERSIONS = ["SDGB150", "SDGB140", "SDGB130", "SDEZ165", "SDEZ160", "MajdataPlay", "SDGB155"];

const parsePctText = (num: number) => `${Number.isFinite(num) ? num.toFixed(1) : "0.0"}%`;



const formatTime = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.toLocaleTimeString("zh-CN", { hour12: false })}`;
};

const formatSpeed = (num: number) => `${Number.isFinite(num) ? num.toFixed(2) : "0.00"}`;

function CtlBtn({ cmd, icon, name, desc, on, busy, onAction }: { cmd: string; icon: React.ReactNode; name: string; desc: string; on: boolean; busy: boolean; onAction: (cmd: string) => void }) {
  return (
    <button className="c-btn" onClick={() => onAction(cmd)} disabled={busy}
      data-active={on}>
      <div className="flex justify-between items-start">
        <div className="c-icon">{icon}</div>
        {on ? <span className="text-[9px] font-black text-[var(--c-orange)] tracking-wide bg-[rgba(255,80,46,0.2)] px-1 rounded">ON</span> : null}
      </div>
      <div>
        <div className="c-name">{name}</div>
        <div className="c-desc">{desc}</div>
      </div>
    </button>
  );
}

function CtlListItem({ cmd, icon, name, on, busy, onAction, danger }: { cmd: string; icon: React.ReactNode; name: string; on: boolean; busy: boolean; onAction: (cmd: string) => void; danger?: boolean }) {
  return (
    <div className={`c-list-btn${danger ? " danger" : ""}`} onClick={() => onAction(cmd)}>
      <div className={`c-list-icon${danger ? " danger" : ""}`}>{icon}</div>
      <span className={`c-list-text${danger ? " danger" : ""}`}>{name}</span>
      <div onClick={(e) => e.stopPropagation()}><Switch checked={on} onCheckedChange={() => onAction(cmd)} disabled={busy} /></div>
    </div>
  );
}

export default function CtlScr({ ssrHealth, ssrConfigs }: { ssrHealth?: Record<string, unknown> | null; ssrConfigs?: Record<string, string> }) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>(null);
  const [health, setHealth] = useState<M2lctlHealth | null>(ssrHealth as M2lctlHealth | null ?? null);
  const [shot, setShot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [configs, setConfigs] = useState<Record<string, string>>(ssrConfigs ?? {});
  const [notice, setNotice] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [intervalSec, setIntervalSec] = useState(5);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [showPublicIp, setShowPublicIp] = useState(false);
  const [ctlPwd, setCtlPwd] = useState("");
  const [shotBorderInset, setShotBorderInset] = useState({ x: 0, y: 0 });
  const [ctlModal, setCtlModal] = useState<CtlModalType>("none");
  const [volumeDraft, setVolumeDraft] = useState(50);
  const [noteSizeDraft, setNoteSizeDraft] = useState("100%");
  const [msgTypeDraft, setMsgTypeDraft] = useState<"1" | "2" | "3">("1");
  const [msgBodyDraft, setMsgBodyDraft] = useState("");
  const [sideloadCoinDraft, setSideloadCoinDraft] = useState(0);
  const [hostsDraft, setHostsDraft] = useState("");
  const [easterCode, setEasterCode] = useState("");
  const restartAlert = useOverlayState();
  const shutdownAlert = useOverlayState();
  const [easterValid, setEasterValid] = useState(false);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(false);
  const [rateLimitDownload, setRateLimitDownload] = useState(0);
  const [rateLimitUpload, setRateLimitUpload] = useState(0);
  const [rateLimitOrder, setRateLimitOrder] = useState(0);
  const [rateLimitExtract, setRateLimitExtract] = useState(0);
  const [orderBlacklistDraft, setOrderBlacklistDraft] = useState("");
  const [orderRemoveDraft, setOrderRemoveDraft] = useState("");
  const [judgeModeDraft] = useState("0");
  const [polling, setPolling] = useState(false);
  const [pollProgress] = useState(0);
  const [pollMsg] = useState("");
  const [ctlMenuOpen, setCtlMenuOpen] = useState(false);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const coinBtnRef = useRef<HTMLButtonElement | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const isLongPressRef = useRef(false);
  const shotRefreshingRef = useRef(false);
  const shotRefreshQueuedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAuth(getAuthCookie());
      setCtlPwd(window.localStorage.getItem("mai2link_ctl_pwd") || "");
      const savedCode = window.localStorage.getItem("mai2link_easter_code") || "";
      setEasterCode(savedCode);
      if (savedCode) setEasterValid(true);
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const refreshHealth = useCallback(async (token: string) => {
    const data = await getM2lctlHealthMai2Link({ token });
    setHealth(data);
  }, []);

  const refreshConfigs = useCallback(async (token: string) => {
    try {
      const res = await m2lCtlIPCConfigGet({ token });
      setConfigs(res.configs);
    } catch {  }
  }, []);

  const refreshShot = useCallback(async (token: string, silent = false) => {
    if (shotRefreshingRef.current) {
      shotRefreshQueuedRef.current = true;
      return;
    }
    shotRefreshingRef.current = true;
    try {
      const dataUrl = await getM2lctlScreenshotMai2Link({ token, pwd: ctlPwd || undefined });
      if (dataUrl) {
        setShot(dataUrl);
        if (!silent) setNotice("截图已更新");
      } else if (!silent) {
        setNotice("截图为空");
      }
    } finally {
      shotRefreshingRef.current = false;
      if (shotRefreshQueuedRef.current) {
        shotRefreshQueuedRef.current = false;
        void refreshShot(token, true);
      }
    }
  }, [ctlPwd]);

  /** Refresh health + shot + configs together */
  const tickAll = useCallback((token: string) => {
    refreshHealth(token).catch(() => undefined);
    refreshShot(token, true).catch(() => undefined);
    refreshConfigs(token).catch(() => undefined);
  }, [refreshHealth, refreshShot, refreshConfigs]);

  useEffect(() => {
    if (!auth?.token) return;
    let active = true;
    tickAll(auth.token);
    return () => { active = false; };
  }, [auth?.token, tickAll]);

  useEffect(() => {
    if (!auth?.token || !autoRefresh) return;
    tickAll(auth.token);
    const timer = window.setInterval(() => tickAll(auth.token), Math.max(1, intervalSec) * 1000);
    return () => window.clearInterval(timer);
  }, [auth?.token, autoRefresh, intervalSec, tickAll]);



  const runCtl = async (operation: string, param = "") => {
    if (!auth?.token) {
      setNotice("未登录或 Token 已失效");
      return;
    }
    setBusy(true);
    try {
      if (operation === "get-screenshot") {
        await refreshShot(auth.token);
        await refreshHealth(auth.token);
        return;
      }
      const pwd = easterCode || ctlPwd || undefined;
      const result = await execM2lctlOp(auth.token, operation, param, pwd);
      setNotice(result.msg);
      await Promise.all([refreshHealth(auth.token), refreshConfigs(auth.token)]);
    } catch (e: unknown) {
      setNotice((e as Error).message || "操作失败");
    } finally {
      setBusy(false);
    }
  };

  const handleAction = async (cmd: string) => {
    const modal = (type: CtlModalType, init?: () => void) => { init?.(); setCtlModal(type); };
    const actions: Record<string, () => void | Promise<void>> = {
      "Freedom模式": () => runCtl("set-freedom"),
      "快速跳过/重开": () => runCtl("set-quick-skip"),
      "强制启用快速重试": () => runCtl("set-always-quick-retry"),
      "音量控制": () => modal("volume", () => setVolumeDraft(50)),
      "抓取截图": () => runCtl("get-screenshot"),
      "切换显示网络图标": () => runCtl("set-offline-mode"),
      "发送游戏弹窗": () => modal("gameMsg", () => { setMsgTypeDraft("1"); setMsgBodyDraft(""); }),
      "修改音符大小": () => modal("noteSize", () => setNoteSizeDraft("100%")),
      "侧载模式": () => modal("sideload"),
      "侧载投币数设置": () => modal("sideloadCoin", () => setSideloadCoinDraft(0)),
      "自定义主显示器位置": () => runCtl("set-primary-monitor", getCfg("set-primary-monitor") ? "0" : "1"),
      "切换启动页面样式": () => runCtl("set-screen-night"),
      "Hosts文件编辑": async () => {
        if (!auth?.token) return;
        setBusy(true);
        try {
          const oldHosts = await getHostsMai2Link({ token: auth.token });
          setHostsDraft(oldHosts);
          setCtlModal("hosts");
        } catch (e: unknown) {
          setNotice((e as Error).message || "保存 Hosts 失败");
        } finally { setBusy(false); }
      },
      "自定义更新限速设置": () => modal("rateLimit", () => {
        setRateLimitEnabled(false); setRateLimitDownload(0); setRateLimitUpload(0);
        setRateLimitOrder(0); setRateLimitExtract(0);
      }),
      "禁用 Mai2Link Order": () => runCtl("set-disable-m2l-order"),
      "禁用启动时应用更新包": () => runCtl("set-disable-order-release"),
      "禁用 Mai2Link 启动页面": () => runCtl("set-disable-initialize-screen"),
      "Order项黑名单列表": () => { setOrderBlacklistDraft(""); setCtlModal("orderBlacklist"); },
      "订单项黑名单列表": () => { setOrderBlacklistDraft(""); setCtlModal("orderBlacklist"); },
      "Order项数据删除列表": () => { setOrderRemoveDraft(""); setCtlModal("orderRemoveList"); },
      "订单项数据删除列表": () => { setOrderRemoveDraft(""); setCtlModal("orderRemoveList"); },
      "无限计时器": () => runCtl("set-infinity-timer"),
      "AutoPlay模式": () => runCtl("set-autoplay"),
      "测试模式": () => runCtl("set-testmode"),
      "操作管理": () => runCtl("set-game-judge", "operation-manager"),
      "启用机台热重载": () => runCtl("set-enable-hot-reload"),
      "机台热重载": () => runCtl("set-hot-reload"),
      "重启机台": () => restartAlert.open(),
      "关闭机台": () => shutdownAlert.open(),
    };
    await actions[cmd]?.();
  };

  const startPress = () => {
    isLongPressRef.current = false;
    if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current);
    pressTimerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true;
      setSideloadCoinDraft(5);
      setCtlModal("sideloadCoin");
    }, 600);
  };

  const endPress = () => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (!isLongPressRef.current) {
      runCtl("set-credit", "1");
    }
  };

  const installRows = useMemo(() => {
    if (health?.orderDetails.length) {
      return health.orderDetails.map((item) => ({
        path: `M:\\m2lctl-option\\${item.name}`,
        value: item.rfState ? String(item.rfState) : String(Math.round(item.progress)),
      }));
    }
    return FALLBACK_ORDER_NAMES.map((name) => ({ path: `M:\\m2lctl-option\\${name}`, value: "0" }));
  }, [health]);

  const handleShotLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth || 0;
    const h = img.naturalHeight || 0;
    if (!w || !h) {
      setShotBorderInset({ x: 0, y: 0 });
      return;
    }
    const containerRatio = 16 / 9;
    const imageRatio = w / h;
    if (imageRatio > containerRatio) {
      const y = ((1 - containerRatio / imageRatio) / 2) * 100;
      setShotBorderInset({ x: 0, y: Number.isFinite(y) ? y : 0 });
    } else {
      const x = ((1 - imageRatio / containerRatio) / 2) * 100;
      setShotBorderInset({ x: Number.isFinite(x) ? x : 0, y: 0 });
    }
  };

  const maskedPublicIp = useMemo(() => {
    const ip = health?.publicIp || "-";
    if (showPublicIp || ip === "-") return ip;
    return "*".repeat(Math.max(ip.length, 8));
  }, [health?.publicIp, showPublicIp]);

  const getCfg = (op: string): boolean => {
    if (op === "set-testmode") return configs["set-test-mode"] === "1";
    return configs[op] === "1";
  };

  const easterUnlocked = easterValid;
  const closeCtlModal = () => setCtlModal("none");

  const handleModalConfirm = () => {
    switch (ctlModal) {
      case "volume": confirmVolume(); break;
      case "noteSize": confirmNoteSize(); break;
      case "gameMsg": confirmGameMsg(); break;
      case "sideloadCoin": confirmSideloadCoin(); break;
      case "hosts": confirmHosts(); break;
      case "orderBlacklist": runCtl("set-order-blacklist", orderBlacklistDraft); closeCtlModal(); break;
      case "orderRemoveList": runCtl("set-order-remove-list", orderRemoveDraft); closeCtlModal(); break;
      case "rateLimit": runCtl("set-order-speed", JSON.stringify({ enable: rateLimitEnabled, download: rateLimitDownload, hash_download: rateLimitUpload, hash_install: rateLimitOrder, install: rateLimitExtract })); closeCtlModal(); break;
      case "easterEgg":
        window.localStorage.setItem("mai2link_easter_code", easterCode);
        if (auth?.token) {
          execM2lctlOp(auth.token, "get-system-volume", "", easterCode).then(() => { setEasterValid(true); setNotice("彩蛋码验证通过"); }).catch(() => { setEasterValid(false); setNotice("彩蛋码无效"); });
        }
        closeCtlModal(); break;
      default: closeCtlModal();
    }
  };

  const confirmVolume = async () => {
    await runCtl("set-system-volume", String(volumeDraft));
    closeCtlModal();
  };

  const confirmNoteSize = async () => {
    const value = noteSizeDraft.trim();
    if (!value) {
      setNotice("音符大小不能为空");
      return;
    }
    await runCtl("set-note-size", value);
    closeCtlModal();
  };

  const confirmGameMsg = async () => {
    const body = msgBodyDraft.trim();
    if (!body) {
      setNotice("弹窗内容不能为空");
      return;
    }
    await runCtl("set-game-msg-alert", `${msgTypeDraft}|Mai2Link|${body}`);
    closeCtlModal();
  };

  const confirmSideloadCoin = async () => {
    await runCtl("set-sideload-coin", String(sideloadCoinDraft));
    closeCtlModal();
  };

  const confirmHosts = async () => {
    if (!auth?.token) {
      setNotice("未登录或 Token 已失效");
      return;
    }
    setBusy(true);
    try {
      const result = await setHostsMai2Link({ token: auth.token, hosts: hostsDraft });
      setNotice(result.msg);
      closeCtlModal();
    } catch (e: unknown) {
      setNotice((e as Error).message || "保存 Hosts 失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
    <div className="m2l-ctl-root">
      <div className="app-container">
        <button onClick={() => router.back()} className="btn-back fixed top-5 left-5 z-[1000] bg-black/55 text-white rounded-full w-9 h-9 flex items-center justify-center backdrop-blur">
          <ChevronLeft size={20} />
        </button>
        {polling && (
          <div className="ctl-toast">
            <div className="ctl-toast-bar">
              <div className="ctl-toast-progress" style={{ width: `${pollProgress}%` }} />
            </div>
            <span className="whitespace-nowrap">{pollMsg || "执行中..."}</span>
            <button onClick={() => { setPolling(false); }} className="ctl-toast-close">
              ✕
            </button>
          </div>
        )}
        {sheetExpanded ? <div className="sheet-backdrop" onMouseDown={() => { const s = sheetRef.current; if (!s) return; s.style.transition = "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)"; s.style.transform = "translateY(calc(100% - 110px))"; setSheetExpanded(false); }} onTouchStart={() => { const s = sheetRef.current; if (!s) return; s.style.transition = "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)"; s.style.transform = "translateY(calc(100% - 110px))"; setSheetExpanded(false); }} /> : null}
        <div className="dashboard-scroll">
          <div className="top-status">
            <div className="flex flex-col gap-1">
               <div className="online-badge">
                <div className="dot" />
                {health?.online ? "ONLINE" : "OFFLINE"}
              </div>
              <div className="sys-info">MAI2LINK / VER {health?.branch || "N/A"}</div>
            </div>
            <div className="last-report">
              <span className="last-report-label">LAST REPORT</span>
              <span>{formatTime(health?.timestamp || "")}</span>
            </div>
          </div>

          <div className="metrics-inline">
            <div className="metrics-inline-left">
              <div className="metric-inline-item">
                <Cpu />
                <span>CPU {Math.round(health?.cpuUsage || 0)}%</span>
              </div>
              <div className="metric-inline-item">
                <HardDrive />
                <span>RAM {(health?.memUsage || 0).toFixed(1)}%</span>
              </div>
              <div className="metric-inline-item">
                <Clock3 />
                <span>UPTIME {health?.uptime || "0H 0M"}</span>
              </div>
            </div>
              <div className="metrics-inline-right">
                <div className="speed-inline-item">
                  <ArrowUp />
                  <strong>{formatSpeed(health?.uploadMbps || 0)}</strong>
                </div>
                <div className="speed-inline-item">
                  <ArrowDown />
                  <strong>{formatSpeed(health?.downloadMbps || 0)}</strong>
                </div>
              </div>
            </div>

          <div className="monitor-section">
            <div className="monitor-frame">
              {shot ? (
                <>
                  <Image src={shot} alt="机台截图" className="monitor-shot" fill sizes="100%" onLoad={handleShotLoad} />
                  <div
                    className="monitor-dyn-border"
                    style={
                      {
                        "--shot-border-x": `${shotBorderInset.x}%`,
                        "--shot-border-y": `${shotBorderInset.y}%`,
                      } as React.CSSProperties
                    }
                  />
                </>
              ) : null}
              {!shot ? <div className="monitor-overlay">{health?.online ? "ONLINE" : "OFFLINE"}</div> : null}
            </div>
            <div className="capture-controls">
              <button className="btn-capture" disabled={busy} onClick={() => runCtl("get-screenshot")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                抓取截图
              </button>
              <div className="auto-refresh-group">
                <span className="text-xs font-bold text-[var(--c-text-mut)]">自动刷新</span>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} size="sm" />
                <input
                  type="number"
                  className="interval-input"
                  value={intervalSec}
                  min={1}
                  onChange={(e) => setIntervalSec(Math.max(1, Number(e.target.value) || 1))}
                />
                <span className="text-xs font-bold text-[var(--c-text-mut)]">s</span>
              </div>
            </div>
          </div>

          <div className="data-card">
            <div className="dc-title">
              <span className="title-inline">
                <Globe />
                网络与连接检查
              </span>
            </div>
            <div className="list-row">
              <span>本地 IP</span>
              <span className="val">{health?.localIp || "-"}</span>
            </div>
            <div className="list-row">
              <span>网关 IP</span>
              <span className="val">{health?.gatewayIp || "-"}</span>
            </div>
            <div className="list-row">
              <span>公网 IP</span>
              <span className="val ip-with-eye">
                {maskedPublicIp}
                <button type="button" className="ip-eye-btn" onClick={() => setShowPublicIp((v) => !v)} aria-label="toggle-public-ip">
                  {showPublicIp ? <EyeOff /> : <Eye />}
                </button>
              </span>
            </div>
            <div className="text-[11px] font-black text-[var(--c-text-mut)] my-4">HTTP 连接</div>
            {health?.httpChecks.map((check, idx) =>
              check.success ? (
                <div className="list-row" key={`http-ok-${idx}`}>
                  <span>{check.name}</span>
                  <span className="val">{check.pingMs}ms</span>
                </div>
              ) : (
                <details key={`http-fail-${idx}`}>
                  <summary>
                    {check.name} <span className="val err">Timeout ▼</span>
                  </summary>
                  <div className="err-box">{check.errorMsg || "i/o timeout"}</div>
                </details>
              ),
            )}
            <div className="text-[11px] font-black text-[var(--c-text-mut)] my-4">TCP 连接</div>
            {health?.tcpChecks.map((check, idx) =>
              check.success ? (
                <div className="list-row" key={`tcp-ok-${idx}`}>
                  <span>{check.name}</span>
                  <span className="val">{check.pingMs}ms</span>
                </div>
              ) : (
                <details key={`tcp-fail-${idx}`}>
                  <summary>
                    {check.name} <span className="val err">Timeout ▼</span>
                  </summary>
                  <div className="err-box">{check.errorMsg || "i/o timeout"}</div>
                </details>
              ),
            )}
          </div>

          <div className="data-card">
            <div className="dc-title">
              <span className="title-inline">
                <ClipboardList />
                Order 健康状态
              </span>{" "}
              <span className="sub">总: {health?.orderTotal || 0} | 已完成: {health?.orderDone || 0} | 待处理: {health?.orderPending || 0}</span>
            </div>
            <div className="ctl-card-item">
              <div className="ctl-order-detail">
                <div className="ctl-order-header">
                  <span>当前处理: {health?.currentItem || health?.currentOrder || "-"}</span>
                  <span className="val ok">
                    {health?.currentStatus || "-"} ({Math.round(health?.downloadProgress || 0)}%)
                  </span>
                </div>
              </div>
            </div>
            <details>
              <summary>点击查看全部 {health?.orderDetails.length || 0} 项Order详情 ▼</summary>
              <div className="pt-2">
                {health?.orderDetails.map((item, idx) => (
                  <div className="list-row col" key={`order-${idx}`}>
                    <div className="flex w-full justify-between">
                      <span>{item.name}</span>
                      <span className="val ok">{Math.round(item.progress)}%</span>
                    </div>
                    <div className="ctl-order-sub">
                      状态码: {item.rfState} ({item.rfStateDesc || item.status})
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>

          <div className="data-card">
            <div className="dc-title">
              <span className="title-inline">
                <HardDrive />
                存储空间信息
              </span>
            </div>
            {health?.disks.map((disk, idx) => {
              const used = Math.max(0, disk.totalGb - disk.freeGb);
              const pct = disk.totalGb > 0 ? (used / disk.totalGb) * 100 : 0;
              return (
                <div className="storage-item" key={`disk-${idx}`}>
                  <div className="s-head">
                    <span>
                      {disk.driveLetter} {parsePctText(pct)}
                    </span>
                    <span className="text-[var(--c-text-mut)]">可用 {disk.freeGb.toFixed(2)} GB</span>
                  </div>
                  <div className="s-bar">
                    <div className="s-fill" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                  </div>
                  <div className="s-detail">
                    <span>
                      总 {disk.totalGb.toFixed(2)}GB / 已用 {used.toFixed(2)}GB
                    </span>
                    <span>
                      读 {disk.readSpeed.toFixed(2)} / 写 {disk.writeSpeed.toFixed(2)} MB/s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="data-card">
            <div className="dc-title">
              <span className="title-inline">
                <FolderTree />
                安装路径统计
              </span>
            </div>
            {installRows.map((row, idx) => (
              <div className="list-row" key={`inst-${idx}`}>
                <span className="text-[11px] break-all">{row.path}</span>
                <span className="val">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bottom-sheet" id="bottom-sheet" ref={sheetRef}>
          <div className="px-6 pt-2 pb-1 flex justify-center">
            <button onClick={() => { const s = sheetRef.current; if (!s) return; s.style.transition = "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)"; s.style.transform = sheetExpanded ? "translateY(calc(100% - 110px))" : "translateY(0px)"; setSheetExpanded(!sheetExpanded); }} className="bg-white/10 border-none rounded-full px-5 py-1.5 text-white text-xs font-bold cursor-pointer tracking-wide">
              {sheetExpanded ? "收回" : "展开"}
            </button>
          </div>
          <div className="sheet-header no-select">
              <div className="flex items-baseline gap-2 flex-wrap">
                <div className="sheet-title">Mai2Link Controller</div>
                <div className="text-[11px] text-white/50 font-bold">远程控制转发服机台</div>
              </div>
              <button
                onClick={() => {
                  if (easterValid) {
                    setEasterCode(""); setEasterValid(false); window.localStorage.removeItem("mai2link_easter_code");
                    setNotice("彩蛋码已清除");
                  } else {
                    setEasterCode(window.localStorage.getItem("mai2link_easter_code") || "");
                    setCtlModal("easterEgg");
                  }
                }}
                className={`ctl-easter-btn ${easterValid ? "text-[var(--c-orange)]" : "text-white/25"}`}
                title={easterValid ? "点击清除彩蛋码" : "输入彩蛋码"}
              >🥚</button>
              {notice ? <div className="ctl-notice">{notice}</div> : null}
            </div>
          <div className="control-scroll no-select">
            <div className="section-label">快捷操作</div>
            <div className="control-grid">
              <CtlBtn cmd="Freedom模式" icon={<Bird />} name="Freedom 模式" desc="启用/禁用特殊功能" on={getCfg("set-freedom")} busy={busy} onAction={handleAction} />
              <CtlBtn cmd="快速跳过/重开" icon={<Zap />} name="快速跳过/重开" desc="优化游戏体验流程" on={getCfg("set-quick-skip")} busy={busy} onAction={handleAction} />
              <CtlBtn cmd="强制启用快速重试" icon={<Zap />} name="强制快速重试" desc="开启或关闭强制重试" on={getCfg("set-always-quick-retry")} busy={busy} onAction={handleAction} />
              <CtlBtn cmd="音量控制" icon={<Volume2 />} name="音量控制" desc="设置机台系统音量" on={getCfg("set-system-volume")} busy={busy} onAction={handleAction} />
              <CtlBtn cmd="抓取截图" icon={<Camera />} name="抓取机台截图" desc="获取当前屏幕画面" on={false} busy={busy} onAction={handleAction} />
              <CtlBtn cmd="切换显示网络图标" icon={<Globe />} name="切换网络图标" desc="绿网/灰网显示" on={getCfg("set-offline-mode")} busy={busy} onAction={handleAction} />
              <CtlBtn cmd="发送游戏弹窗" icon={<MessageSquare />} name="发送游戏弹窗" desc="自定义消息弹窗" on={false} busy={busy} onAction={handleAction} />
              <CtlBtn cmd="修改音符大小" icon={<Music2 />} name="修改音符大小" desc="调整显示的音符尺寸" on={false} busy={busy} onAction={handleAction} />
              {easterUnlocked ? (
                <button className="c-btn egg" id="btn-coin" ref={coinBtnRef} onTouchStart={startPress} onTouchEnd={endPress} onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={() => { if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current); }} disabled={busy}>
                  <div className="c-icon"><Coins /></div>
                  <div>
                    <div className="c-name text-[var(--c-orange)]">机台投币</div>
                    <div className="c-desc">单击1个，长按自定义</div>
                  </div>
                </button>
              ) : null}
              {easterUnlocked ? (<CtlBtn cmd="无限计时器" icon={<Clock3 />} name="无限计时器" desc="开启/关闭限制" on={getCfg("set-infinity-timer")} busy={busy} onAction={handleAction} />) : null}
              {easterUnlocked ? (<CtlBtn cmd="AutoPlay模式" icon={<Gamepad2 />} name="AutoPlay模式" desc="自动控制游戏进程" on={getCfg("set-autoplay")} busy={busy} onAction={handleAction} />) : null}
              {easterUnlocked ? (<CtlBtn cmd="测试模式" icon={<FlaskConical />} name="测试模式" desc="切换用于调试功能" on={getCfg("set-testmode")} busy={busy} onAction={handleAction} />) : null}
            </div>

            <div className="section-label">菜单</div>
            <div className="ctl-card-list">
              <CtlListItem cmd="自定义主显示器位置" icon={<Monitor />} name="自定义主显示器位置" on={getCfg("set-primary-monitor")} busy={busy} onAction={handleAction} />
              <CtlListItem cmd="切换启动页面样式" icon={<Palette />} name="切换启动页面样式 (ALLS/魔改)" on={getCfg("set-screen-night")} busy={busy} onAction={handleAction} />
              <CtlListItem cmd="禁用 Mai2Link Order" icon={<Ban />} name="禁用 Mai2Link Order" danger on={getCfg("set-disable-m2l-order")} busy={busy} onAction={handleAction} />
              <CtlListItem cmd="禁用启动时应用更新包" icon={<Package />} name="禁用启动时应用更新包" on={getCfg("set-disable-order-release")} busy={busy} onAction={handleAction} />
              <CtlListItem cmd="禁用 Mai2Link 启动页面" icon={<Monitor />} name="禁用 Mai2Link 启动页面" on={getCfg("set-disable-initialize-screen")} busy={busy} onAction={handleAction} />
              <CtlListItem cmd="启用机台热重载" icon={<Flame />} name="启用机台热重载" on={getCfg("set-enable-hot-reload")} busy={busy} onAction={handleAction} />
            </div>

            <div className="section-label">配置</div>
            <div className="ctl-card-list">
              <button className="c-list-btn" onClick={() => handleAction("侧载模式")} disabled={busy}>
                <div className="c-list-left"><span className="c-list-icon"><Package /></span><span className="c-list-text">侧载模式配置 (永久生效)</span></div>
                <ChevronRight className="list-chevron" />
              </button>
              <button className="c-list-btn" onClick={() => handleAction("侧载投币数设置")} disabled={busy}>
                <div className="c-list-left"><span className="c-list-icon"><Coins /></span><span className="c-list-text">侧载版本投币数设置</span></div>
                <ChevronRight className="list-chevron" />
              </button>
              <button className="c-list-btn" onClick={() => handleAction("Hosts文件编辑")} disabled={busy}>
                <div className="c-list-left"><span className="c-list-icon"><FilePenLine /></span><span className="c-list-text">编辑 Hosts 网络访问配置</span></div>
                <ChevronRight className="list-chevron" />
              </button>
              <button className="c-list-btn" onClick={() => handleAction("自定义更新限速设置")} disabled={busy}>
                <div className="c-list-left"><span className="c-list-icon"><Timer /></span><span className="c-list-text">自定义机台更新限速设置</span></div>
                <ChevronRight className="list-chevron" />
              </button>
              <button className="c-list-btn" onClick={() => handleAction("Order项黑名单列表")} disabled={busy}>
                <div className="c-list-left"><span className="c-list-icon"><Ban /></span><span className="c-list-text">Order项黑名单列表</span></div>
                <ChevronRight className="list-chevron" />
              </button>
              <button className="c-list-btn" onClick={() => handleAction("Order项数据删除列表")} disabled={busy}>
                <div className="c-list-left"><span className="c-list-icon"><Trash2 /></span><span className="c-list-text">Order项数据删除列表</span></div>
                <ChevronRight className="list-chevron" />
              </button>
              <button className="c-list-btn" onClick={() => handleAction("操作管理")} disabled={busy}>
                <div className="c-list-left"><span className="c-list-icon"><Settings /></span><span className="c-list-text">清理历史</span></div>
                <ChevronRight className="list-chevron" />
              </button>
            </div>

            <div className="section-label">危险操作</div>
            <div className="ctl-card-list">
              <button className="c-list-btn" onClick={() => handleAction("机台热重载")} disabled={busy}>
                <div className="c-list-left"><span className="c-list-icon"><Zap /></span><span className="c-list-text">执行机台热重载 (无需重启切换)</span></div>
                <ChevronRight className="list-chevron" />
              </button>
              <button className="c-list-btn danger" onClick={() => handleAction("重启机台")} disabled={busy}>
                <div className="c-list-left"><span className="c-list-icon"><RefreshCw /></span><span className="c-list-text">重启</span></div>
                <ChevronRight className="list-chevron" />
              </button>
              <button className="c-list-btn danger" onClick={() => handleAction("关闭机台")} disabled={busy}>
                <div className="c-list-left"><span className="c-list-icon"><Power /></span><span className="c-list-text">关机</span></div>
                <ChevronRight className="list-chevron" />
              </button>
            </div>
          </div>
        </div>
        {ctlModal !== "none" ? (
          <div className="ctl-modal-mask" onMouseDown={closeCtlModal} onTouchStart={closeCtlModal}>
            <div
              className={`ctl-modal-card ${ctlModal === "hosts" ? "is-large" : ""}`}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {ctlModal === "volume" ? (
                <>
                  <div className="ctl-modal-title">设置机台音量</div>
                  <div className="ctl-modal-value">{volumeDraft}</div>
                  <Slider value={[volumeDraft]} onValueChange={(v) => setVolumeDraft(Array.isArray(v) ? v[0] : v)} min={0} max={100} step={1} />
                </>
              ) : null}
              {ctlModal === "noteSize" ? (
                <>
                  <div className="ctl-modal-title">修改音符大小</div>
                  <input
                    type="text"
                    value={noteSizeDraft}
                    onChange={(e) => setNoteSizeDraft(e.target.value)}
                    className="ctl-modal-input"
                    placeholder="100%"
                  />
                </>
              ) : null}
              {ctlModal === "gameMsg" ? (
                <>
                  <div className="ctl-modal-title">发送游戏弹窗</div>
                  <div className="ctl-msg-type-row">
                    <button
                      type="button"
                      className={`ctl-msg-type-btn ${msgTypeDraft === "1" ? "active" : ""}`}
                      onClick={() => setMsgTypeDraft("1")}
                    >
                      普通
                    </button>
                    <button
                      type="button"
                      className={`ctl-msg-type-btn ${msgTypeDraft === "3" ? "active" : ""}`}
                      onClick={() => setMsgTypeDraft("3")}
                    >
                      警告
                    </button>
                    <button
                      type="button"
                      className={`ctl-msg-type-btn ${msgTypeDraft === "2" ? "active" : ""}`}
                      onClick={() => setMsgTypeDraft("2")}
                    >
                      KOP
                    </button>
                  </div>
                  <input
                    type="text"
                    value={msgBodyDraft}
                    onChange={(e) => setMsgBodyDraft(e.target.value)}
                    className="ctl-modal-input"
                    placeholder="输入弹窗内容"
                  />
                </>
              ) : null}
              {ctlModal === "sideloadCoin" ? (
                <>
                  <div className="ctl-modal-title">远程投币</div>
                  <div className="ctl-modal-value">{sideloadCoinDraft}</div>
                  <Slider value={[sideloadCoinDraft]} onValueChange={(v) => setSideloadCoinDraft(Array.isArray(v) ? v[0] : v)} min={-5} max={5} step={1} />
                </>
              ) : null}
              {ctlModal === "hosts" ? (
                <>
                  <div className="ctl-modal-title">编辑 Hosts 网络访问配置</div>
                  <textarea value={hostsDraft} onChange={(e) => setHostsDraft(e.target.value)} className="ctl-modal-textarea" />
                </>
              ) : null}
              {ctlModal === "sideload" ? (
                <>
                  <div className="ctl-modal-title">选择侧载版本</div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {SIDELOAD_VERSIONS.map((v) => (
                      <button key={v} onClick={async () => { closeCtlModal(); await runCtl("set-sideload", v); setNotice("侧载版本已切换，如需重启请在面板操作"); }} className="ctl-modal-btn confirm w-full">{v}</button>
                    ))}
                  </div>
                </>
              ) : null}
              {ctlModal === "rateLimit" ? (
                <>
                  <div className="ctl-modal-title">自定义更新限速设置</div>
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={rateLimitEnabled} onChange={(e) => setRateLimitEnabled(e.target.checked)} />
                      启用限速
                    </label>
                    {["下载", "上传", "订单", "解压"].map((label, i) => {
                      const v = [rateLimitDownload, rateLimitUpload, rateLimitOrder, rateLimitExtract];
                      const s = [setRateLimitDownload, setRateLimitUpload, setRateLimitOrder, setRateLimitExtract];
                      return <input key={label} className="ctl-modal-input" placeholder={`${label}限速 (MB/s)`} type="number" value={v[i]} onChange={(e) => s[i](Math.max(0, Number(e.target.value) || 0))} />;
                    })}
                  </div>
                </>
              ) : null}
              {ctlModal === "orderBlacklist" ? (
                <>
                  <div className="ctl-modal-title">订单项黑名单列表</div>
                  <textarea value={orderBlacklistDraft} onChange={(e) => setOrderBlacklistDraft(e.target.value)} className="ctl-modal-textarea" placeholder="逗号分隔" />
                </>
              ) : null}
              {ctlModal === "orderRemoveList" ? (
                <>
                  <div className="ctl-modal-title">订单项数据删除列表</div>
                  <textarea value={orderRemoveDraft} onChange={(e) => setOrderRemoveDraft(e.target.value)} className="ctl-modal-textarea" placeholder="逗号分隔" />
                </>
              ) : null}
              {ctlModal === "judgeMode" ? (
                <>
                  <div className="ctl-modal-title">选择判定模式</div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {["默认", "宽松", "严格", "非常严格"].map((label, i) => (
                      <button key={i} onClick={() => { runCtl("set-game-judge", String(i)); closeCtlModal(); }} className={`ctl-modal-btn confirm w-full ${judgeModeDraft === String(i) ? "active" : ""}`}>{label}</button>
                    ))}
                  </div>
                </>
              ) : null}
              {ctlModal === "easterEgg" ? (
                <>
                  <div className="ctl-modal-title">彩蛋码设置</div>
                  <input className="ctl-modal-input mt-2" value={easterCode} onChange={(e) => setEasterCode(e.target.value)} placeholder="输入彩蛋码" />
                  <div className="text-[11px] text-[var(--c-text-mut)] mt-1.5">输入后保存，后端校验通过后可解锁特殊功能</div>
                </>
              ) : null}
              <div className="ctl-modal-actions">
                <button type="button" className="ctl-modal-btn cancel" onClick={closeCtlModal} disabled={busy}>取消</button>
                <button type="button" className="ctl-modal-btn confirm" onClick={handleModalConfirm} disabled={busy}>
                  {busy ? "处理中..." : "确认"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </div>

    <AlertDialog>
      <AlertDialog.Backdrop isOpen={restartAlert.isOpen} onOpenChange={restartAlert.setOpen} className="z-[1001]">
        <AlertDialog.Container size="sm">
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="warning" />
              <AlertDialog.Heading>重启机台</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>确定要重启机台吗？此操作将中断当前游戏进程。</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">取消</Button>
              <Button slot="close" variant="primary" onPress={() => runCtl("restart")}>确认重启</Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>

    <AlertDialog>
      <AlertDialog.Backdrop isOpen={shutdownAlert.isOpen} onOpenChange={shutdownAlert.setOpen} className="z-[1001]">
        <AlertDialog.Container size="sm">
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>关闭机台</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>确定要关闭机台吗？此操作不可撤销。</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">取消</Button>
              <Button slot="close" variant="danger" onPress={() => runCtl("shutdown")}>确认关闭</Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
    </>
  );
}
