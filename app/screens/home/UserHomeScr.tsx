"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import UserHomeView from "./UserHomeView";
import { getAuthCookie } from "@/lib/auth-cookie";
import { getActiveUser, getActiveMachine } from "@/lib/auth-storage";
import { revalidateUserData } from "@/actions/revalidate";
import {
  getForwardRulesMai2Link,
  upsertForwardRuleMai2Link,
  playlogGet,
  playerQueueGet,
} from "@/lib/mai2link-api";

function parseSsrData(ssrData?: Record<string, unknown>) {
  const init = {
    activeRuleCount: 0,
    settingFixLoginState: false,
    settingUnlockMusic: false,
    settingUserName: "",
    arcadeName: "",
    machines: [] as { name: string; cid: string }[],
    lastRecord: null as { title: string; dxScore: number; totalDxScore: number; achievement: number; rank: string } | null,
    rating: 0,
    ratingDelta: 0,
    qrAccessCode: "",
    m2lId: "",
    userId: "",
  };
  if (!ssrData || Object.keys(ssrData).length === 0) return init;

  const rules = ssrData.rules as Record<string, { enable: boolean; value: string }> | undefined;
  if (rules) {
    init.activeRuleCount = Object.values(rules).filter((r) => r.enable).length;
    init.settingFixLoginState = rules["fixLoginState"]?.enable ?? false;
    init.settingUnlockMusic = rules["fixUnlockHOTMusic"]?.enable ?? false;
    init.settingUserName = rules["fixUserName"]?.value ?? "";
    const logonMachine = rules["LogonMachineList"] as { value?: string } | undefined;
    if (logonMachine?.value) {
      try {
        const parsed = JSON.parse(logonMachine.value) as { name?: string; cid?: string }[];
        init.machines = parsed.map((m) => ({ name: m.name || "", cid: m.cid || "" }));
        if (parsed.length > 0) init.arcadeName = parsed[0].name || parsed[0].cid || "";
      } catch { init.arcadeName = logonMachine.value; }
    }
  }

  const playlogList = ssrData.playlogList as Array<Record<string, unknown>> | undefined;
  if (playlogList && playlogList.length > 0) {
    const latest = playlogList[0];
    const mid = Number(latest.musicId ?? 0);
    const dxScore = Number(latest.deluxscore ?? 0);
    const tdc = Number(latest.totalCombo ?? 1);
    const achievement = Number(latest.achievement ?? 0) / 10000;
    const afterRt = Number(latest.afterRating ?? 0);
    const beforeRt = Number(latest.beforeRating ?? 0);
    init.rating = afterRt;
    init.ratingDelta = afterRt - beforeRt;
    const pct = achievement;
    const rankLabel = pct >= 100.5 ? "SSS+" : pct >= 100.0 ? "SSS" : pct >= 99.5 ? "SS+" : pct >= 99.0 ? "SS" : pct >= 98.0 ? "S+" : pct >= 97.0 ? "S" : pct >= 94.0 ? "AAA" : pct >= 90.0 ? "AA" : pct >= 80.0 ? "A" : pct >= 75.0 ? "BBB" : pct >= 70.0 ? "BB" : pct >= 60.0 ? "B" : pct >= 50.0 ? "C" : "D";
    init.lastRecord = { title: `TRACK #${mid}`, dxScore, totalDxScore: tdc * 3, achievement, rank: rankLabel };
  }

  init.qrAccessCode = (ssrData.qrAccessCode as string) || "";
  init.m2lId = (ssrData.m2lId as string) || "";
  init.userId = (ssrData.userId as string) || "";
  return init;
}

export default function UserHomeScr({ ssrData }: { ssrData?: Record<string, unknown> }) {
  const router = useRouter();
  const [auth] = useState(() => getAuthCookie());
  const [activeUser] = useState(() => getActiveUser());
  const [activeMachine] = useState(() => getActiveMachine());

  const cookieToken = auth?.token || null;
  const userToken = activeUser?.token || null;
  const isMachine = Boolean(activeMachine);

  const ssrInit = useMemo(() => parseSsrData(ssrData), [ssrData]);

  const [activeRuleCount, setActiveRuleCount] = useState(ssrInit.activeRuleCount);
  const [settingFixLoginState, setSettingFixLoginState] = useState(ssrInit.settingFixLoginState);
  const [settingUnlockMusic, setSettingUnlockMusic] = useState(ssrInit.settingUnlockMusic);
  const [settingUserName, setSettingUserName] = useState(ssrInit.settingUserName);

  const [arcadeName, setArcadeName] = useState(ssrInit.arcadeName);
  const [onlinePlayerNames, setOnlinePlayerNames] = useState<string[]>([]);
  const [lastHourCount, setLastHourCount] = useState(0);
  const [onlinePlayers, setOnlinePlayers] = useState<Array<{ userName: string; loginTime: string; playDuration: number; playDurationFormatted: string }>>([]);
  const [recentPlayRecords, setRecentPlayRecords] = useState<Array<{ userName: string; loginTime: string; logoutTime: string; durationFormatted: string }>>([]);
  const [lastRecord, setLastRecord] = useState<{ title: string; dxScore: number; totalDxScore: number; achievement: number; rank: string } | null>(ssrInit.lastRecord);
  const [rating, setRating] = useState(ssrInit.rating);
  const [ratingDelta, setRatingDelta] = useState(ssrInit.ratingDelta);
  const [qrAccessCode, _setQrAccessCode] = useState(ssrInit.qrAccessCode);
  const [m2lId, _setM2lId] = useState(ssrInit.m2lId);
  const [userId, _setUserId] = useState(ssrInit.userId);

  const [machines, setMachines] = useState<{ name: string; cid: string }[]>(ssrInit.machines);

  useEffect(() => {
    if (!cookieToken) { router.push("/"); return; }
  }, [cookieToken, router]);

  const loadRules = useCallback(async () => {
    const tk = userToken || cookieToken;
    if (!tk) return;
    try {
      const rules = await getForwardRulesMai2Link({ token: tk });
      const entries = Object.entries(rules);
      setActiveRuleCount(entries.filter(([, r]) => r.enable).length);
      setSettingFixLoginState(rules["fixLoginState"]?.enable ?? false);
      setSettingUnlockMusic(rules["fixUnlockHOTMusic"]?.enable ?? false);
      setSettingUserName(rules["fixUserName"]?.value ?? "");

      const logonMachine = rules["LogonMachineList"] as { value?: string } | undefined;
      if (logonMachine?.value) {
        try {
          const parsed = JSON.parse(logonMachine.value) as { name?: string; cid?: string }[];
          setMachines(parsed.map((m) => ({ name: m.name || "", cid: m.cid || "" })));
          if (parsed.length > 0) {
            setArcadeName(parsed[0].name || parsed[0].cid || "");
          }
        } catch {
          setArcadeName(logonMachine.value);
        }
      }
    } catch { console.error("loadRules failed"); }
  }, [userToken, cookieToken]);

  const didRun = useRef(false);
  const mounted = useRef(true);

  useEffect(() => { return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    if (!cookieToken) return;
    const tk = userToken || cookieToken;

    const playlogList = ssrData?.playlogList as Array<Record<string, unknown>> | undefined;
    const ssrMid = Number((playlogList?.[0] as Record<string, unknown> | undefined)?.musicId ?? 0);

    const tryFetchTitle = (musicId: number) => {
      if (musicId <= 0 || !mounted.current) return;
      const dir = `music${String(musicId).padStart(6, "0")}`;
      fetch(`/charts/${dir}/Music.xml`).then(r => r.text()).then(xml => {
        const m = xml.match(/<name[^>]*>[\s\S]*?<str>([^<]+)<\/str>/);
        if (m && m[1] && mounted.current) setLastRecord(prev => prev ? { ...prev, title: m[1] } : null);
      }).catch(() => {});
    };

    if (!playlogList || playlogList.length === 0) {
      playlogGet({ token: tk, start: 0, end: 50 }).then(res => {
        const list = (res.playlogList as Array<Record<string, unknown>> || []);
        if (list.length > 0) {
          const pct = Number(list[0].achievement ?? 0) / 10000;
          const rankLabel = pct >= 100.5 ? "SSS+" : pct >= 100.0 ? "SSS" : pct >= 99.5 ? "SS+" : pct >= 99.0 ? "SS" : pct >= 98.0 ? "S+" : pct >= 97.0 ? "S" : pct >= 94.0 ? "AAA" : pct >= 90.0 ? "AA" : pct >= 80.0 ? "A" : pct >= 75.0 ? "BBB" : pct >= 70.0 ? "BB" : pct >= 60.0 ? "B" : pct >= 50.0 ? "C" : "D";
          setLastRecord({ title: `TRACK #${Number(list[0].musicId ?? 0)}`, dxScore: Number(list[0].deluxscore ?? 0), totalDxScore: (Number(list[0].totalCombo ?? 1)) * 3, achievement: pct, rank: rankLabel });
          setRating(Number(list[0].afterRating ?? 0));
          setRatingDelta(Number(list[0].afterRating ?? 0) - Number(list[0].beforeRating ?? 0));
          tryFetchTitle(Number(list[0].musicId ?? 0));
        }
      }).catch(() => console.error("loadPlaylog failed"));
    } else if (ssrMid > 0) {
      tryFetchTitle(ssrMid);
    }

    getForwardRulesMai2Link({ token: tk }).then(rules => {
      setActiveRuleCount(Object.values(rules).filter((r) => r.enable).length);
      setSettingFixLoginState(rules["fixLoginState"]?.enable ?? false);
      setSettingUnlockMusic(rules["fixUnlockHOTMusic"]?.enable ?? false);
      setSettingUserName(rules["fixUserName"]?.value ?? "");
      const logonMachine = rules["LogonMachineList"] as { value?: string } | undefined;
      let cid = "";
      if (logonMachine?.value) {
        try {
          const parsed = JSON.parse(logonMachine.value) as { name?: string; cid?: string }[];
          setMachines(parsed.map((m) => ({ name: m.name || "", cid: m.cid || "" })));
          if (parsed.length > 0) {
            setArcadeName(parsed[0].name || parsed[0].cid || "");
            cid = parsed[0].cid || "";
          }
        } catch { setArcadeName(logonMachine.value); }
      }
      if (cid) {
        playerQueueGet({ token: tk, clientId: cid }).then(res => {
          const data = res.playerQueueData as Record<string, unknown> || {};
          const stats = data.statistics as Record<string, unknown> || {};
          setLastHourCount(Number(stats.last1HourCount ?? 0));
          const online = (data.currentOnlinePlayers as Array<Record<string, unknown>> || []) as Array<{ userName: string; loginTime: string; playDuration: number; playDurationFormatted: string }>;
          setOnlinePlayers(online);
          setOnlinePlayerNames(online.map((p) => String(p.userName || "")));
          const recent = (data.recentPlayRecords as Array<Record<string, unknown>> || []);
          setRecentPlayRecords(recent.map((r) => ({ userName: String(r.userName || ""), loginTime: String(r.loginTime || ""), logoutTime: String(r.logoutTime || ""), durationFormatted: String(r.durationFormatted || "") })));
        }).catch(() => console.error("loadQueue failed"));
      }
    }).catch(() => console.error("loadRules failed"));
  }, [cookieToken, userToken, ssrData]);

  const handleToggle = useCallback(async (rule: string, enable: boolean) => {
    const tk = userToken || cookieToken;
    if (!tk) return;
    try {
      await upsertForwardRuleMai2Link({ token: tk, rule, enable, value: "1" });
      revalidateUserData();
      if (mounted.current) await loadRules();
    } catch { console.error("handleToggle failed"); }
  }, [userToken, cookieToken, loadRules]);

  const onToggleOffline = useCallback(() => handleToggle("fixLoginState", !settingFixLoginState), [handleToggle, settingFixLoginState]);
  const onToggleUnlockMusic = useCallback(async (key: string) => {
    if (!userToken) return;
    const enable = !settingUnlockMusic;
    await Promise.all([
      upsertForwardRuleMai2Link({ token: userToken, rule: "fixSpecialClientPassword", enable, value: key }),
      upsertForwardRuleMai2Link({ token: userToken, rule: "fixUnlockHOTMusic", enable, value: "1" }),
      upsertForwardRuleMai2Link({ token: userToken, rule: "fixUnlockALLMusic", enable, value: "1" }),
    ]);
    setSettingUnlockMusic(enable);
    revalidateUserData();
  }, [userToken, settingUnlockMusic]);
  const onChangeUserName = useCallback(async (name: string) => {
    if (!userToken) return;
    setSettingUserName(name);
    await upsertForwardRuleMai2Link({ token: userToken, rule: "fixUserName", enable: !!name, value: name });
    revalidateUserData();
  }, [userToken]);

  return (
    <UserHomeView
      rating={rating}
      ratingDelta={ratingDelta}
      activeRuleCount={activeRuleCount}
      isMachine={isMachine}
      arcadeName={arcadeName}
      onlinePlayerNames={onlinePlayerNames}
      lastHourCount={lastHourCount}
      onlinePlayers={onlinePlayers}
      recentPlayRecords={recentPlayRecords}
      lastRecord={lastRecord}
      qrAccessCode={qrAccessCode}
      machines={machines}
      m2lId={m2lId}
      userId={userId}
      settingFixLoginState={settingFixLoginState}
      settingUnlockMusic={settingUnlockMusic}
      settingUserName={settingUserName}
      onToggleOffline={onToggleOffline}
      onToggleUnlockMusic={onToggleUnlockMusic}
      onChangeUserName={onChangeUserName}
    />
  );
}