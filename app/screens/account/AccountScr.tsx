"use client";

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import { Select, ListBox, Button, AlertDialog, Accordion, Input } from "@heroui/react";
import {
  getAccounts, setActiveUser, setActiveMachine, addAccount, removeAccount,
  syncAuthCookies, getActiveUser, getActiveMachine, updateAccountRemark, Account,
} from "@/lib/auth-storage";

import { loginMai2Link, getForwardRulesMai2Link, upsertForwardRuleMai2Link } from "@/lib/mai2link-api";
import { revalidateUserData } from "@/actions/revalidate";
import { Switch } from "@/components/ui/switch";
import ThemeToggle from "@/components/ThemeToggle";
import { User, ChevronLeft, MessageSquare, Pencil, Trash2, Plus, Monitor, Check, PackageSearch, Image as ImageIcon, Database, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";


import UploadCachePage from "./UploadCachePage";
import PhotosPage from "./PhotosPage";
import BackupPage from "./BackupPage";import styles from "../../account/account.module.css";

const USER_RULES = [
  "LogonMachineList", "fixAuthTime", "fixRegionName", "fixLoginState",
  "fixDisableAutoBlackRoomSolution", "fixBanState", "fixInheritLastLoginDate",
  "fixLastDataVersion", "fixLastRomVersion", "fixUploadDataVersion", "fixUploadRomVersion",
  "fixRival", "fixKaleidxScopeKey", "fixForceSetPartner", "fixUserName",
  "fixAutoFixTicket", "fixForceGetRival", "fixDisableEmptyRival",
  "fixForceGetFriendRivalDataWhenDoCheck", "fixUploadHighVersionUserData",
  "fixTestEmptyMusic", "fixTestModifyMusicList", "fixTestEmptyItem", "fixTestEmptyMap",
  "fixTestEmptyCharacter", "fixTestEmptyLoginBonus", "fixTestEmptyCharge",
  "fixTestSwallowCookies", "fixForceUploadItemAndMapDataForDifferentVersion",
  "fixSpecialClientPassword", "fixUnlockCHNMusic", "fixUnlockHOTMusic", "fixUnlockALLMusic",
  "fixLockFanmadeMusic",
];

const MACHINE_RULES = [
  "fixMachineEnableMai2LinkServer", "fixMachineConnectToOfficialServer",
  "fixMachineEnableMai2LinkVPN", "fixMachineEnableMai2LinkMachineProxy",
  "fixMachineEnableMai2LinkMachineProxyPool", "fixMachineEnableCustomSocks5Proxy",
  "fixMachineProxyPriority", "fixMachineUserWhiteList", "fixMachineUserBlackList",
  "fixMachineBanMusicList", "fixMachineLockFanmadeMusic", "fixMachineLastDataVersion",
  "fixMachineLastRomVersion", "fixMachineUploadDataVersion", "fixMachineUploadRomVersion",
  "fixMachineDisableAutoAddUserWhiteList", "fixMachineHOTCache",
  "fixClientBehaviorEnableForwardRules", "fixClientBehaviorEnableUserName",
  "fixClientBehaviorEnableCamera", "fixClientBehaviorEnableMai2LinkQRCode",
  "fixClientBehaviorEnableUnlockMusic", "fixClientBehaviorEnableOffline",
];

const RULE_LABELS: Record<string, string> = {
  "LogonMachineList": "设置绑定机台",
  "fixAuthTime": "自定义AuthTime",
  "fixRegionName": "修改上传省份",
  "fixLoginState": "离线登录（跳过黑屋）",
  "fixDisableAutoBlackRoomSolution": "自动规避黑屋",
  "fixBanState": "修改封禁状态",
  "fixInheritLastLoginDate": "是否继承最后一次登录时间",
  "fixLastDataVersion": "修改下拉数据版本",
  "fixLastRomVersion": "修改下拉ROM版本",
  "fixUploadDataVersion": "修改上传数据版本",
  "fixUploadRomVersion": "修改上传ROM版本",
  "fixRival": "修改rival",
  "fixKaleidxScopeKey": "下发万花镜钥匙",
  "fixForceSetPartner": "强制修改搭档",
  "fixUserName": "修改用户名（规范发言温馨提醒）",
  "fixAutoFixTicket": "自动修票",
  "fixDisableEmptyRival": "禁用rival空返回",
  "fixTestEmptyMusic": "返回空乐曲（测试功能）",
  "fixTestModifyMusicList": "返回修改乐曲数据（测试功能）",
  "fixTestEmptyItem": "返回空物品（测试功能）",
  "fixTestEmptyMap": "返回空跑图数据（测试功能）",
  "fixTestEmptyCharacter": "返回空角色数据（测试功能）",
  "fixTestEmptyLoginBonus": "返回空登录奖励（测试功能）",
  "fixTestEmptyCharge": "返回空充值数据（测试功能）",
  "fixTestSwallowCookies": "始终显示吞饼干弹窗（测试功能）",
  "fixSpecialClientPassword": "设置公钥",
  "fixUnlockCHNMusic": "国服全解",
  "fixUnlockHOTMusic": "内测最新最热解锁",
  "fixUnlockALLMusic": "内测全解",
  "fixLockFanmadeMusic": "禁用自制",
  "fixMachineEnableMai2LinkServer": "连接Mai2Link私服",
  "fixMachineConnectToOfficialServer": "直连官服",
  "fixMachineEnableMai2LinkVPN": "启用Mai2Link VPN",
  "fixMachineEnableMai2LinkMachineProxy": "启用机台代理",
  "fixMachineEnableMai2LinkMachineProxyPool": "启用机台代理池",
  "fixMachineEnableCustomSocks5Proxy": "自定socks5代理",
  "fixMachineProxyPriority": "修改代理优先级",
  "fixMachineUserWhiteList": "用户白名单",
  "fixMachineUserBlackList": "用户黑名单",
  "fixMachineBanMusicList": "Ban歌名单",
  "fixMachineLockFanmadeMusic": "禁用自制铺",
  "fixMachineLastDataVersion": "修改数据版本号(Last)",
  "fixMachineLastRomVersion": "修改ROM版本号(Last)",
  "fixMachineUploadDataVersion": "修改数据版本号(Upload)",
  "fixMachineUploadRomVersion": "修改ROM版本号(Upload)",
  "fixMachineDisableAutoAddUserWhiteList": "禁用自动添加用户到白名单",
  "fixMachineHOTCache": "存储最新最热成绩到转发服",
  "fixClientBehaviorEnableForwardRules": "启用转发规则",
  "fixClientBehaviorEnableUserName": "启用用户名功能",
  "fixClientBehaviorEnableCamera": "启用摄像头功能",
  "fixClientBehaviorEnableMai2LinkQRCode": "启用离线访问码",
  "fixClientBehaviorEnableUnlockMusic": "启用解锁乐曲",
  "fixClientBehaviorEnableOffline": "启用黑屋规则",
};

const PROXY_OPTIONS = [
  { value: "123", label: "1=主代理 2=工坊代理 3=自定义" },
  { value: "132", label: "1=主代理 3=自定义 2=工坊代理" },
  { value: "213", label: "2=工坊代理 1=主代理 3=自定义" },
  { value: "231", label: "2=工坊代理 3=自定义 1=主代理" },
  { value: "312", label: "3=自定义 1=主代理 2=工坊代理" },
  { value: "321", label: "3=自定义 2=工坊代理 1=主代理" },
];

interface FwdRule { id: string; name: string; value: string; enabled: boolean; }
type RuleMap = Record<string, { enable: boolean; value: string }>;

function RuleCard({ rule, index, onToggle, onSave }: { rule: FwdRule; index: number; onToggle: (name: string, enable: boolean, value: string) => void; onSave: (name: string, value: string, enabled: boolean) => void }) {
  const [val, setVal] = useState(rule.value);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const isProxy = rule.name === "fixMachineProxyPriority";
  const handleResize = () => { const el = textRef.current; if (el) { el.style.height = "auto"; el.style.height = Math.max(36, el.scrollHeight) + "px"; } };

  return (
    <Accordion.Item id={rule.name}>
      <Accordion.Heading>
        <Accordion.Trigger>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0, overflow: "hidden" }}>
            <span style={{ fontFamily: "var(--font-western)", fontSize: 14, color: "var(--c-text-sub2)", width: 16, textAlign: "center", flexShrink: 0 }}>{index}</span>
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{RULE_LABELS[rule.name] || rule.name}</div>
              {RULE_LABELS[rule.name] && <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--c-text-sub)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{rule.name}</div>}
            </div>
            <div style={{ flexShrink: 0 }}><Switch checked={rule.enabled} onCheckedChange={(e) => onToggle(rule.name, e, val)} /></div>
          </div>
          <Accordion.Indicator />
        </Accordion.Trigger>
      </Accordion.Heading>
      <Accordion.Panel>
        <Accordion.Body>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            {isProxy ? (
              <Select value={val} onChange={(v) => { if (v) setVal(String(v)); }} variant="secondary" className="flex-1">
                <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {PROXY_OPTIONS.map((o) => <ListBox.Item key={o.value}>{o.label}</ListBox.Item>)}
                  </ListBox>
                </Select.Popover>
              </Select>
            ) : (
              <textarea ref={textRef} value={val} onChange={(e) => { setVal(e.target.value); setTimeout(handleResize, 0); }} onFocus={handleResize} placeholder="值" rows={1}
                style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 12, padding: "8px 10px", border: "1px solid var(--c-border)", borderRadius: 8, resize: "none", minHeight: 36, outline: "none", color: "var(--c-text-main)", background: "var(--c-bg-alt)", overflow: "hidden" }} />
            )}
            <Button isIconOnly size="sm" variant="primary" onPress={() => onSave(rule.name, val, rule.enabled)} aria-label="save">
              <Check size={16} />
            </Button>
          </div>
        </Accordion.Body>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

const shimmer = { background: "linear-gradient(90deg, var(--c-border) 25%, var(--c-divider) 50%, var(--c-border) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s ease-in-out infinite" };

const styleEntryBtn = { flexDirection: "column" as const, gap: 4, padding: 12, textAlign: "center" as const };
const styleEntryBtnText = { fontSize: 11, fontWeight: 700, color: "#fff" };
const styleGrid2 = { display: "grid" as const, gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 };
const styleAcctCapsule = { flex: 1, display: "flex" as const, alignItems: "center" as const, gap: 8, background: "var(--c-surface)", borderRadius: 99, padding: "10px 16px", boxShadow: "var(--shadow-sm)" };
const styleAcctCapsuleText = { fontSize: 12, fontWeight: 700, color: "var(--c-text-main)" as const, overflow: "hidden" as const, textOverflow: "ellipsis", whiteSpace: "nowrap" as const };
const styleCapsuleIcon = { color: "var(--c-orange)" as const, flexShrink: 0 };
const styleSectionLabel = { fontSize: 11, fontWeight: 700, color: "var(--c-text-sub)", letterSpacing: 1, marginBottom: 8 };
const styleToastBox = { position: "fixed" as const, top: 80, left: "50%", transform: "translateX(-50%)", background: "var(--c-black)", color: "#fff", padding: "10px 24px", borderRadius: 99, fontSize: 13, fontWeight: 700, zIndex: 1000, display: "flex" as const, alignItems: "center" as const, gap: 6, animation: "page-fade-in 0.2s ease-out" };
const styleThemeBtn = { background: "none", border: "none", color: "var(--c-text-mut)", cursor: "pointer" as const, padding: 4, display: "flex" as const };
const styleThemeMenuPanel = { position: "absolute" as const, top: 44, right: 0, background: "var(--c-surface)" as const, borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", width: 200, zIndex: 100, padding: 16 };
const styleThemeBackdrop = { position: "fixed" as const, inset: 0, zIndex: 99 };
const stylePageFadeIn = { animation: "page-fade-in 0.25s ease-out" };
const stylePageFadeIn03 = { marginTop: 20, animation: "page-fade-in 0.3s ease-out" };

function RuleSkeleton({ count }: { count?: number }) {
  return <>{Array.from({ length: count ?? 3 }).map((_, i) => <div key={i} style={{ height: 48, borderRadius: 12, marginBottom: 8, ...shimmer }} />)}</>;
}

function buildRules(rules: RuleMap, names: string[]): FwdRule[] {
  const map = new Map(Object.entries(rules));
  return names.map((n) => { const e = map.get(n); return { id: n, name: n, value: e?.value ?? "", enabled: e?.enable ?? false }; });
}

export default function AccountManagementScr() {
  const [activeTab, setActiveTab] = useState("root");
  const [accounts, setAccounts] = useState<Account[]>(() => getAccounts());
  const [activeUserAcc, setActiveUserAcc] = useState<Account | null>(() => getActiveUser());
  const [activeMachineAcc, setActiveMachineAcc] = useState<Account | null>(() => getActiveMachine());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalClosing, setAddModalClosing] = useState(false);
  const closeAddModal = () => { setAddModalClosing(true); setTimeout(() => { setAddModalOpen(false); setAddModalClosing(false); }, 200); };
  const [loginMode, setLoginMode] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [password, setPassword] = useState("");

  const [userRules, setUserRules] = useState<FwdRule[]>(() => buildRules({} as Record<string, { enable: boolean; value: string }>, USER_RULES));
  const [machineRules, setMachineRules] = useState<FwdRule[]>(() => buildRules({} as Record<string, { enable: boolean; value: string }>, MACHINE_RULES));
  const [rulesLoading, setRulesLoading] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const [toast, setToast] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const showToast = useCallback((m: string) => { setToast(m); setToastShow(true); setTimeout(() => setToastShow(false), 2500); }, []);

  const userToken = activeUserAcc?.token;
  const machineToken = activeMachineAcc?.token;
  const tk = userToken || machineToken;

  const userAccounts = useMemo(() => accounts.filter((a) => !a.isMachine), [accounts]);
  const machineAccounts = useMemo(() => accounts.filter((a) => a.isMachine), [accounts]);

  const handleSwitchAccount = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (acc) {
      if (acc.isMachine) { setActiveMachine(id); setActiveMachineAcc(acc); }
      else { setActiveUser(id); setActiveUserAcc(acc); }
      syncAuthCookies(acc); setAccounts(getAccounts());
    }
  };
  const handleRemoveAccount = (id: string) => {
    removeAccount(id);
    if (activeUserAcc?.id === id) setActiveUserAcc(null);
    if (activeMachineAcc?.id === id) setActiveMachineAcc(null);
    setAccounts(getAccounts());
  };
  const [remarkTarget, setRemarkTarget] = useState<{ id: string; remark: string } | null>(null);

  const handleEditRemark = (id: string, currentRemark?: string) => {
    setRemarkTarget({ id, remark: currentRemark || "" });
  };
  const handleAddAccount = async () => {
    try {
      const payload = loginMode === 0 ? { qrcode: inputVal.trim() } : { username: inputVal.trim(), password: password.trim() };
      const res = await loginMai2Link(payload);
      if (res.token) {
        const newAcc = addAccount(res.token, res.isMachine, res.token.slice(0, 8), "新添加的账号");
        if (res.isMachine) { setActiveMachine(newAcc.id); setActiveMachineAcc(newAcc); }
        else { setActiveUser(newAcc.id); setActiveUserAcc(newAcc); }
        syncAuthCookies(newAcc); setAccounts(getAccounts()); setAddModalOpen(false);
      } else showToast(res.msg || "登录失败");
    } catch { showToast("登录接口调用失败"); }
  };

  const loadRules = useCallback(async () => {
    if (!userToken && !machineToken) return;
    setRulesLoading(true);
    try {

      if (activeUserAcc) {
        const d = await getForwardRulesMai2Link({ token: userToken! });
        setUserRules(buildRules(d, USER_RULES));
      }

      if (activeMachineAcc && machineToken) {

        const init = await getForwardRulesMai2Link({ token: machineToken });
        const lm = init["LogonMachineList"] as { value?: string } | undefined;
        if (lm?.value) {
          try {
            const parsed = JSON.parse(lm.value) as { name?: string; cid?: string }[];
            const cid = parsed[0]?.cid;
            if (cid) {
              const mData = await getForwardRulesMai2Link({ token: machineToken, clientId: cid });
              setMachineRules(buildRules(mData, MACHINE_RULES));
            } else { setMachineRules(buildRules(init, MACHINE_RULES)); }
          } catch { setMachineRules(buildRules(init, MACHINE_RULES)); }
        } else { setMachineRules(buildRules(init, MACHINE_RULES)); }
      }
    } catch { console.error("loadRules failed"); showToast("加载转发规则失败"); }
    finally { setRulesLoading(false); }
  }, [userToken, machineToken, activeUserAcc, activeMachineAcc, showToast]);

  const didLoadRules = useRef(false);

  useEffect(() => { if (didLoadRules.current) return; didLoadRules.current = true; if (!tk) return; startTransition(() => { loadRules(); }); }, [tk, loadRules]);

  const toggleRule = useCallback(async (name: string, enable: boolean, value: string) => {
    const tok = USER_RULES.includes(name) ? userToken : machineToken;
    if (!tok) return;
    const upd = (prev: FwdRule[]) => prev.map((r) => (r.id === name ? { ...r, enabled: enable } : r));
    if (USER_RULES.includes(name)) setUserRules(upd); else setMachineRules(upd);
      try { await upsertForwardRuleMai2Link({ token: tok, rule: name, enable, value }); showToast(enable ? "已启用" : "已停用"); revalidateUserData(); }
    catch {
      console.error("toggleRule failed", name);
      const revert = (prev: FwdRule[]) => prev.map((r) => (r.id === name ? { ...r, enabled: !enable } : r));
      if (USER_RULES.includes(name)) setUserRules(revert); else setMachineRules(revert);
      showToast("操作失败");
    }
  }, [userToken, machineToken, showToast]);

  const saveRule = useCallback(async (name: string, value: string, enabled: boolean) => {
    const tok = USER_RULES.includes(name) ? userToken : machineToken;
    if (!tok) return;
      try { await upsertForwardRuleMai2Link({ token: tok, rule: name, enable: enabled, value }); showToast("已保存"); revalidateUserData(); }
    catch { console.error("saveRule failed"); showToast("保存失败"); }
  }, [userToken, machineToken, showToast]);

  return (
    <div className={styles['m2l-account-root']} key={`${activeUserAcc?.id}-${activeMachineAcc?.id}`}>
      <div className={styles['app-container']}>
        {activeTab === "root" && (
          <main className={styles['view-content']} style={stylePageFadeIn}>
            <header className={styles['top-nav']}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div className="page-header-title">ACCOUNT</div>
                <div style={{ position: "relative" }}>
                  <div onClick={() => setThemeMenuOpen(!themeMenuOpen)} className="page-header-avatar">M</div>
                  {themeMenuOpen && (
                    <div style={styleThemeMenuPanel} onClick={(e) => e.stopPropagation()}>
                      <ThemeToggle />
                    </div>
                  )}
                  {themeMenuOpen && <div style={styleThemeBackdrop} onClick={() => setThemeMenuOpen(false)} />}
                </div>
              </div>
            </header>
            <div style={styleGrid2}>
              <button className={styles['account-entry-btn']} onClick={() => setActiveTab("manage")} style={styleEntryBtn}>
                <User size={20} color="white" />
                <div style={styleEntryBtnText}>账号管理</div>
              </button>
              <button className={styles['account-entry-btn']} onClick={() => setActiveTab("upload-cache")} style={styleEntryBtn}>
                <PackageSearch size={20} color="white" />
                <div style={styleEntryBtnText}>上传缓存</div>
              </button>
              <button className={styles['account-entry-btn']} onClick={() => setActiveTab("photos")} style={styleEntryBtn}>
                <ImageIcon size={20} color="white" />
                <div style={styleEntryBtnText}>查看相册</div>
              </button>
              <button className={styles['account-entry-btn']} onClick={() => setActiveTab("backup")} style={styleEntryBtn}>
                <Database size={20} color="white" />
                <div style={styleEntryBtnText}>数据备份</div>
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <div style={styleAcctCapsule}>
                <User size={16} style={styleCapsuleIcon} />
                <span style={styleAcctCapsuleText}>{activeUserAcc?.remark || activeUserAcc?.name || "未登录"}</span>
              </div>
              <div style={styleAcctCapsule}>
                <Monitor size={16} style={styleCapsuleIcon} />
                <span style={styleAcctCapsuleText}>{activeMachineAcc?.remark || activeMachineAcc?.name || "未登录"}</span>
              </div>
            </div>

            {toastShow && (
              <div style={styleToastBox}>
                <Check size={14} /> {toast}
              </div>
            )}

            {activeUserAcc && (
              <div style={stylePageFadeIn03}>
                <div style={styleSectionLabel}>用户规则</div>
                <Accordion variant="surface">
                  {rulesLoading ? <RuleSkeleton count={4} /> : userRules.map((r, i) => (
                    <RuleCard key={r.id + r.value} rule={r} index={i + 1} onToggle={toggleRule} onSave={saveRule} />
                  ))}
                </Accordion>
              </div>
            )}

            {activeMachineAcc && (
              <div style={stylePageFadeIn03}>
                <div style={styleSectionLabel}>机台规则</div>
                <Accordion variant="surface">
                  {rulesLoading ? <RuleSkeleton count={4} /> : machineRules.map((r, i) => (
                    <RuleCard key={r.id + r.value} rule={r} index={i + 1} onToggle={toggleRule} onSave={saveRule} />
                  ))}
                </Accordion>
              </div>
            )}
          </main>
        )}

        {activeTab === "manage" && (
          <div className={`${styles['sub-page']} ${styles.active}`} style={stylePageFadeIn}>
            <header className={styles['sub-header']}>
              <button className={styles['btn-back']} onClick={() => setActiveTab("root")}><ChevronLeft size={20} />返回</button>
              <h2 className={styles['sub-title']}>账号管理</h2>
              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "切换浅色模式" : "切换深色模式"}
                style={styleThemeBtn}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </header>
            <main className={styles['sub-content']}>
              <h3 className={styles['section-title']}><User size={18} style={{ marginRight: 8 }} />用户帐户</h3>
              {userAccounts.map((acc, i) => (
                <div key={acc.id} className={`${styles['acct-card']} ${activeUserAcc?.id === acc.id ? styles.active : ""}`} style={{ animation: `slide-up 0.2s ease-out ${i * 0.04}s both` }} onClick={() => handleSwitchAccount(acc.id)}>
                  {activeUserAcc?.id === acc.id && <div className={styles['active-badge']}>CURRENT</div>}
                  <div className={`${styles['acct-avatar']} ${styles['avatar-user']}`}>U</div>
                  <div className={styles['acct-info']}>
                    <div className={styles['acct-name']}>{acc.name}</div>
                    <div className={styles['acct-remark']}><MessageSquare size={12} /> {acc.remark || "无备注"}</div>
                  </div>
                  <div className={styles['acct-actions']}>
                    <button className={styles['btn-action']} onClick={(e) => { e.stopPropagation(); handleEditRemark(acc.id, acc.remark); }}><Pencil size={14} /></button>
                    {activeUserAcc?.id !== acc.id && <button className={styles['btn-action']} onClick={(e) => { e.stopPropagation(); handleRemoveAccount(acc.id); }}><Trash2 size={14} /></button>}
                  </div>
                </div>
              ))}
              <button className={styles['btn-add-acct']} onClick={() => setAddModalOpen(true)}><Plus size={16} /> 添加新用户帐户</button>
              <h3 className={styles['section-title']}><Monitor size={18} style={{ marginRight: 8 }} />机台账号</h3>
              {machineAccounts.map((acc, i) => (
                <div key={acc.id} className={`${styles['acct-card']} ${activeMachineAcc?.id === acc.id ? styles.active : ""}`} style={{ animation: `slide-up 0.2s ease-out ${i * 0.04}s both` }} onClick={() => handleSwitchAccount(acc.id)}>
                  {activeMachineAcc?.id === acc.id && <div className={styles['active-badge']}>CURRENT</div>}
                  <div className={`${styles['acct-avatar']} ${styles['avatar-machine']}`}>M</div>
                  <div className={styles['acct-info']}>
                    <div className={styles['acct-name']}>{acc.remark || acc.name}</div>
                    <div className={styles['acct-remark']}><MessageSquare size={12} /> {acc.remark || "无备注"}</div>
                  </div>
                  <div className={styles['acct-actions']}>
                    <button className={styles['btn-action']} onClick={(e) => { e.stopPropagation(); handleEditRemark(acc.id, acc.remark); }}><Pencil size={14} /></button>
                    {activeMachineAcc?.id !== acc.id && <button className={styles['btn-action']} onClick={(e) => { e.stopPropagation(); handleRemoveAccount(acc.id); }}><Trash2 size={14} /></button>}
                  </div>
                </div>
              ))}
              <button className={styles['btn-add-acct']} onClick={() => setAddModalOpen(true)}><Plus size={16} /> 添加新机台账号</button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
                <button className={styles['btn-add-acct']} onClick={() => {
                  const data = { version: "1.0", exportTime: new Date().toISOString(), tokens: accounts.map(a => ({ token: a.token, name: a.name, isMachine: a.isMachine, remark: a.remark })) };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = `mai2link-accounts-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click(); URL.revokeObjectURL(url);
                }} style={{ border: "2px solid var(--c-border)", borderRadius: 16, padding: 14, background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--c-text-sub)" }}>
                  导出账号
                </button>
                <button className={styles['btn-add-acct']} onClick={() => document.getElementById("import-input")?.click()} style={{ border: "2px solid var(--c-border)", borderRadius: 16, padding: 14, background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--c-text-sub)" }}>
                  导入账号
                </button>
              </div>
              <input id="import-input" type="file" accept=".json" style={{ display: "none" }} onChange={(e) => {
                const file = e.target.files?.[0]; if (!file) return;
                file.text().then(t => {
                  try {
                    const data = JSON.parse(t);
                    if (!data.tokens || !Array.isArray(data.tokens)) { showToast("文件格式错误"); return; }
                    let added = 0, skipped = 0;
                    const existing = getAccounts();
                    data.tokens.forEach((t: { token: string; name: string; isMachine?: boolean; remark?: string }) => {
                      if (!t.token || !t.name) return;
                      if (existing.some(a => a.token === t.token)) { skipped++; return; }
                      addAccount(t.token, t.isMachine || false, t.name, t.remark || "");
                      added++;
                    });
                    setAccounts(getAccounts());
                    showToast(`导入完成: 成功 ${added}, 跳过 ${skipped}`);
                  } catch { showToast("文件解析失败"); }
                });
                e.target.value = "";
              }} />
            </main>
          </div>
        )}

        {activeTab === "upload-cache" && (
          <div className={`${styles['sub-page']} ${styles.active}`} style={stylePageFadeIn}>
            <header className={styles['sub-header']}>
              <button className={styles['btn-back']} onClick={() => setActiveTab("root")}><ChevronLeft size={20} />返回</button>
              <h2 className={styles['sub-title']}>上传缓存数据</h2>
              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "切换浅色模式" : "切换深色模式"}
                style={styleThemeBtn}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </header>
            <main className={styles['sub-content']}>
              <UploadCachePage token={tk ?? null} showToast={showToast} />
            </main>
          </div>
        )}

        {activeTab === "photos" && (
          <div className={`${styles['sub-page']} ${styles.active}`} style={stylePageFadeIn}>
            <header className={styles['sub-header']}>
              <button className={styles['btn-back']} onClick={() => setActiveTab("root")}><ChevronLeft size={20} />返回</button>
              <h2 className={styles['sub-title']}>查看相册</h2>
              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "切换浅色模式" : "切换深色模式"}
                style={styleThemeBtn}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </header>
            <main className={styles['sub-content']}>
              <PhotosPage token={tk ?? null} showToast={showToast} />
            </main>
          </div>
        )}

        {activeTab === "backup" && (
          <div className={`${styles['sub-page']} ${styles.active}`} style={stylePageFadeIn}>
            <header className={styles['sub-header']}>
              <button className={styles['btn-back']} onClick={() => setActiveTab("root")}><ChevronLeft size={20} />返回</button>
              <h2 className={styles['sub-title']}>账号数据备份</h2>
              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "切换浅色模式" : "切换深色模式"}
                style={styleThemeBtn}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </header>
            <main className={styles['sub-content']}>
              <BackupPage token={tk ?? null} showToast={showToast} />
            </main>
          </div>
        )}

        {remarkTarget && (
          <AlertDialog>
            <AlertDialog.Backdrop isOpen={!!remarkTarget} onOpenChange={() => setRemarkTarget(null)}>
              <AlertDialog.Container size="sm">
                <AlertDialog.Dialog>
                  <AlertDialog.CloseTrigger />
                  <AlertDialog.Header>
                    <AlertDialog.Heading>编辑备注</AlertDialog.Heading>
                  </AlertDialog.Header>
                  <AlertDialog.Body>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontSize: 12, color: "var(--c-text-sub)", fontWeight: 600 }}>为当前账号设置一个易记的名称</div>
                      <Input variant="secondary" placeholder="输入备注名称" value={remarkTarget.remark} onChange={(e) => setRemarkTarget({ ...remarkTarget, remark: e.target.value })} />
                    </div>
                  </AlertDialog.Body>
                  <AlertDialog.Footer>
                    <Button slot="close" variant="tertiary">取消</Button>
                    <Button variant="primary" onPress={() => { updateAccountRemark(remarkTarget.id, remarkTarget.remark); setAccounts(getAccounts()); setRemarkTarget(null); showToast("备注已更新"); }}>保存</Button>
                  </AlertDialog.Footer>
                </AlertDialog.Dialog>
              </AlertDialog.Container>
            </AlertDialog.Backdrop>
          </AlertDialog>
        )}

        {(addModalOpen || addModalClosing) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" style={{ animation: addModalClosing ? "modal-backdrop-out 0.2s ease-out forwards" : "modal-backdrop 0.2s ease-out" }} onClick={closeAddModal}>
            <div className={styles['modal-box']} onClick={(e) => e.stopPropagation()}>
              <h2 className="mb-2 font-black text-lg">添加账号</h2>
              <div className="flex gap-4 border-b-2 border-gray-100 mb-2">
                <button onClick={() => setLoginMode(0)} className={`pb-3 font-bold text-sm ${loginMode === 0 ? "text-black border-b-2 border-orange-500" : "text-gray-400"}`}>二维码</button>
                <button onClick={() => setLoginMode(1)} className={`pb-3 font-bold text-sm ${loginMode === 1 ? "text-black border-b-2 border-orange-500" : "text-gray-400"}`}>账号密码</button>
              </div>
              {loginMode === 0 ? (
                <input className="w-full border border-gray-200 rounded-xl bg-white px-4 py-3 my-2 text-sm outline-none focus:border-orange-500" placeholder="粘贴二维码" value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
              ) : (
                <div className="my-2 flex flex-col gap-2">
                  <input className="w-full border border-gray-200 rounded-xl bg-white px-4 py-3 text-sm outline-none focus:border-orange-500" placeholder="用户名" value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
                  <input className="w-full border border-gray-200 rounded-xl bg-white px-4 py-3 text-sm outline-none focus:border-orange-500" placeholder="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              )}
              <button className="w-full mt-2 bg-orange-500 text-white rounded-xl py-4 font-bold text-base hover:bg-orange-600 active:scale-95 transition" onClick={handleAddAccount}>确认绑定</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}