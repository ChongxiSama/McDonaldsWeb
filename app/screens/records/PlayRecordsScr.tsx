"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getActiveUser } from "@/lib/auth-storage";
import { playlogGet } from "@/lib/mai2link-api";
import PlayRecordsView, { type PlaylogItem } from "./PlayRecordsView";

const PAGE_SIZE = 20;

function parsePlaylogItem(r: Record<string, unknown>): PlaylogItem {
  return {
    musicId: r.musicId as number, musicTitle: r.musicTitle as string, level: (r.level ?? 3) as number,
    achievement: (r.achievement ?? 0) as number, deluxscore: (r.deluxscore ?? 0) as number, totalCombo: (r.totalCombo ?? 0) as number,
    maxCombo: (r.maxCombo ?? 0) as number, maxSync: (r.maxSync ?? 0) as number, fastCount: (r.fastCount ?? 0) as number, lateCount: (r.lateCount ?? 0) as number,
    userPlayDate: (r.userPlayDate ?? new Date().toISOString()) as string, placeName: (r.placeName ?? "未知店铺") as string, placeId: r.placeId as number,
    isDx: r.isDx as boolean, isClear: r.isClear as boolean, isAchieveNewRecord: r.isAchieveNewRecord as boolean, isDeluxscoreNewRecord: r.isDeluxscoreNewRecord as boolean,
    comboStatus: r.comboStatus as number, syncStatus: r.syncStatus as number, beforeRating: r.beforeRating as number, afterRating: r.afterRating as number,
    beforeDeluxRating: r.beforeDeluxRating as number, afterDeluxRating: r.afterDeluxRating as number, playerNum: r.playerNum as number,
    vsMode: r.vsMode as number, vsUserName: r.vsUserName as string, vsUserRating: r.vsUserRating as number, vsRank: r.vsRank as number,
    isEventMode: r.isEventMode as boolean, isFreedomMode: r.isFreedomMode as boolean, isPlayTutorial: r.isPlayTutorial as boolean, trackNo: r.trackNo as number,
    tapCriticalPerfect: r.tapCriticalPerfect as number, tapPerfect: r.tapPerfect as number, tapGreat: r.tapGreat as number, tapGood: r.tapGood as number, tapMiss: r.tapMiss as number,
    holdCriticalPerfect: r.holdCriticalPerfect as number, holdPerfect: r.holdPerfect as number, holdGreat: r.holdGreat as number, holdGood: r.holdGood as number, holdMiss: r.holdMiss as number,
    slideCriticalPerfect: r.slideCriticalPerfect as number, slidePerfect: r.slidePerfect as number, slideGreat: r.slideGreat as number, slideGood: r.slideGood as number, slideMiss: r.slideMiss as number,
    touchCriticalPerfect: r.touchCriticalPerfect as number, touchPerfect: r.touchPerfect as number, touchGreat: r.touchGreat as number, touchGood: r.touchGood as number, touchMiss: r.touchMiss as number,
    breakCriticalPerfect: r.breakCriticalPerfect as number, breakPerfect: r.breakPerfect as number, breakGreat: r.breakGreat as number, breakGood: r.breakGood as number, breakMiss: r.breakMiss as number,
    isTap: r.isTap as boolean, isHold: r.isHold as boolean, isSlide: r.isSlide as boolean, isTouch: r.isTouch as boolean, isBreak: r.isBreak as boolean,
    isFastLateDisp: r.isFastLateDisp as boolean, playCount: r.playCount as number,
  };
}

export default function PlayRecordsScr({ ssrData }: { ssrData?: { list: unknown[]; total: number } | null }) {
  const router = useRouter();
  const initialRecords = ssrData ? (ssrData.list as Record<string, unknown>[]).map(parsePlaylogItem) : [];

  const [page, setPage] = useState(0);
  const [records, setRecords] = useState<PlaylogItem[]>(initialRecords);
  const [total, setTotal] = useState(ssrData?.total ?? 0);
  const [loading, setLoading] = useState(!ssrData);

  const [refreshing, setRefreshing] = useState(false);

  const fetchPage = useCallback((p: number) => {
    const user = getActiveUser();
    if (!user) { router.push("/account"); return Promise.resolve(); }
    return playlogGet({ token: user.token, start: p * PAGE_SIZE, end: (p + 1) * PAGE_SIZE })
      .then(res => {
        setRecords((res.playlogList ?? []).map((r) => parsePlaylogItem(r as Record<string, unknown>)));
        setTotal(res.total ?? 0);
      });
  }, [router]);

  const didInit = useRef(false);

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      if (ssrData && page === 0) {
        fetchPage(page);
        return;
      }
      fetchPage(page).then(() => setLoading(false));
      return;
    }
    if (page !== 0) {
      fetchPage(page).then(() => setLoading(false));
    }
  }, [page, ssrData, router, fetchPage]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPage(page).then(() => setRefreshing(false));
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PlayRecordsView
      records={records}
      total={total}
      page={page}
      totalPages={totalPages}
      loading={loading}
      refreshing={refreshing}
      onPrev={() => setPage(p => Math.max(0, p - 1))}
      onNext={() => setPage(p => Math.min(totalPages - 1, p + 1))}
      onRefresh={handleRefresh}
    />
  );
}