"use client";

import { useEffect, useState } from "react";
import { ChevronDown, MessageCircle, BarChart3, Globe, ShieldAlert, Heart, Bell, Star, Info } from "lucide-react";
import { Accordion } from "@heroui/react";
import { usageGet } from "@/lib/mai2link-api";
import { getAuthCookie } from "@/lib/auth-cookie";
import ThemeToggle from "@/components/ThemeToggle";

const styleStatCard = { background: "var(--c-bg-alt)", borderRadius: 10, padding: "10px 12px", textAlign: "center" as const };
const styleThemeMenuPanel = { position: "absolute" as const, top: 44, right: 0, background: "var(--c-surface)" as const, borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", width: 200, zIndex: 100, padding: 16 };
const styleThemeBackdrop = { position: "fixed" as const, inset: 0, zIndex: 99 };
const styleOrange = { color: "var(--c-orange)" as const };

type UsageDataRecord = Record<string, unknown>;

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={styleStatCard}>
      <div style={{ fontSize: 20, fontWeight: 900, color: "var(--c-text-main)", fontFamily: "var(--font-western)", lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--c-text-mut)", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 9, color: "var(--c-text-sub)", marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

export default function AboutScr({ ssrUsage }: { ssrUsage?: Record<string, unknown> | null }) {
  const [usage, setUsage] = useState<UsageDataRecord | null>(ssrUsage as UsageDataRecord | null ?? null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  useEffect(() => {
    if (ssrUsage) return;
    const auth = getAuthCookie();
    if (!auth?.token) return;
    let ignore = false;
    usageGet({ token: auth.token }).then((r) => { if (!ignore) setUsage(r.usageData as UsageDataRecord); }).catch(() => {});
    return () => { ignore = true; };
  }, [ssrUsage]);

  const u = usage || {};
  const playerNum = Number(u.playerNum ?? 0);
  const machineNum = Number(u.machineNum ?? 0);
  const forwardRuleNum = Number(u.forwardRuleNum ?? 0);
  const totalRequestNum = Number(u.totalRequestNum ?? 0);
  const onlinePlayerNum = Number(u.onlinePlayerNum ?? 0);
  const onlineMachineNum = Number(u.onlineMachineNum ?? 0);
  const specialMachineNum = Number(u.specialMachineNum ?? 0);

  return (
    <div style={{ background: "var(--c-bg)", minHeight: "100dvh" }}>
      <div className="app-container" style={{ animation: "page-fade-in 0.25s ease-out" }}>
        <div className="page-header">
          <div className="page-header-title">ABOUT</div>
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

        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 100px", scrollbarWidth: "none" }}>


          <div style={{ background: "var(--c-inverse)", borderRadius: 16, padding: 20, color: "#fff", marginBottom: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <div style={{ fontFamily: "var(--font-western)", fontSize: 28, letterSpacing: 1, lineHeight: 1 }}>Mai2Link</div>
            <div style={{ fontSize: 13, marginTop: 4, color: "rgba(255,255,255,0.7)" }}>欢迎使用 Mai2Link</div>
            <div style={{ fontSize: 13, marginTop: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.85)" }}>
              专业的官服数据转发服务<br /><br />
              Mai2Link 是一个专为玩家设计的数据转发服务，帮助您更高效地拉取游戏数据，同时提供上传缓存和额外功能，保证您的游玩数据不会丢失。
            </div>
          </div>

          <Accordion className="w-full" variant="surface">
            <Accordion.Item id="channels">
              <Accordion.Heading>
                <Accordion.Trigger>
                  <MessageCircle size={18} className="mr-3 shrink-0" style={styleOrange} />
                  交流频道/群组/Bot
                  <Accordion.Indicator><ChevronDown size={16} /></Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>
                  <div>Telegram 频道:<br /><strong>@oiiiaiioiiiai</strong></div>
                  <div className="mt-2">Telegram 群组:<br /><strong>@oiiiaiioiiiaii</strong></div>
                  <div className="mt-2">Telegram Bot:<br /><strong>@McDLdshEartBot</strong></div>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item id="usage" defaultExpanded>
              <Accordion.Heading>
                <Accordion.Trigger>
                  <BarChart3 size={18} className="mr-3 shrink-0" style={styleOrange} />
                  使用详情
                  <Accordion.Indicator><ChevronDown size={16} /></Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>
                  <div className="mb-3 text-xs" style={{ color: "var(--c-text-sub)" }}>2025-08-18 ~ 2026-05-16</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <StatCard label="已正常运行 天 (Days)" value={272} sub="Running Days" />
                    <StatCard label="总请求数" value={totalRequestNum.toLocaleString()} sub="Total Requests" />
                    <StatCard label="转发规则总数" value={forwardRuleNum.toLocaleString()} sub="Forward Rules" />
                    <StatCard label="绑定过 Mai2Link 的玩家" value={playerNum.toLocaleString()} sub="Player Bindings" />
                    <StatCard label="连接到转发服的机台数" value={machineNum.toLocaleString()} sub="Connected Machines" />
                    <StatCard label="在线玩家数" value={onlinePlayerNum} sub="Online Players" />
                    <StatCard label="在线机台数" value={onlineMachineNum} sub="Online Machines" />
                    <StatCard label="内测服机台" value={specialMachineNum} sub="Beta Machines" />
                  </div>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item id="region">
              <Accordion.Heading>
                <Accordion.Trigger>
                  <Globe size={18} className="mr-3 shrink-0" style={styleOrange} />
                  地区分布
                  <Accordion.Indicator><ChevronDown size={16} /></Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>
                  <div className="mb-3 text-xs" style={{ color: "var(--c-text-mut)" }}>各省份机台数量分布情况</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    <StatCard label="有数据的省份" value="18" />
                    <StatCard label="机台总数" value={machineNum} />
                    <StatCard label="最多机台省份" value="8" />
                    <StatCard label="平均每省机台" value="2" />
                  </div>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item id="disclaimer">
              <Accordion.Heading>
                <Accordion.Trigger>
                  <ShieldAlert size={18} className="mr-3 shrink-0" style={styleOrange} />
                  免责声明
                  <Accordion.Indicator><ChevronDown size={16} /></Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>
                  <div className="mb-2 text-xs font-bold" style={{ color: "var(--c-danger)" }}>使用本服务前请仔细阅读</div>
                  <ul className="list-disc pl-4">
                    <li>未经许可，你不能对机厅内的商用机台使用此转发服</li>
                    <li>必须获得授权后才能使用，此转发服所造成的任何后果由使用者承担</li>
                    <li>本服务仅供学习研究使用，不得用于任何商业用途</li>
                    <li>服务可能随时中断或终止，不保证服务的稳定性和持续性</li>
                    <li>如不同意本声明内容，请立即停止使用本服务</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item id="features">
              <Accordion.Heading>
                <Accordion.Trigger>
                  <Star size={18} className="mr-3 shrink-0" style={styleOrange} />
                  特性
                  <Accordion.Indicator><ChevronDown size={16} /></Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>
                  <div className="mt-2">支持上传/下拉缓存：即使官服断网仍能正常绿网游玩</div>
                  <div className="mt-2">快速加载：和升级后的国服一样快的加载时间</div>
                  <div className="mt-2">多客户端支持：国/国际/日 三服版本</div>
                  <div className="mt-2">多版本支持：1.00 - 1.65 版本</div>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item id="notes">
              <Accordion.Heading>
                <Accordion.Trigger>
                  <Info size={18} className="mr-3 shrink-0" style={styleOrange} />
                  注意
                  <Accordion.Indicator><ChevronDown size={16} /></Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>
                  <div className="mt-2">• 具体连接情况根据国服和代理网络情况而定</div>
                  <div className="mt-2">• 除必要数据处理外，其余转发的所有数据均与原服务器数据相同</div>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item id="free">
              <Accordion.Heading>
                <Accordion.Trigger>
                  <Heart size={18} className="mr-3 shrink-0" style={styleOrange} />
                  免费使用
                  <Accordion.Indicator><ChevronDown size={16} /></Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>此服务器对于任何人来说都是免费使用的</Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item id="security">
              <Accordion.Heading>
                <Accordion.Trigger>
                  <Bell size={18} className="mr-3 shrink-0" style={styleOrange} />
                  安全提醒
                  <Accordion.Indicator><ChevronDown size={16} /></Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>请勿泄漏访问码和永久二维码。妥善保管您的登录凭证。</Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <div style={{ textAlign: "center", fontSize: 11, color: "var(--c-text-sub)", padding: "20px 0" }}>
            © 2026 Mai2Link 保留所有权利。
          </div>
        </div>

      </div>
    </div>
  );
}

