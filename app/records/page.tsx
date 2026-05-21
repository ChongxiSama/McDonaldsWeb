export const runtime = "edge";

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { playlogGet } from "@/lib/mai2link-api";
import PlayRecordsScr from "../screens/records/PlayRecordsScr";

export const metadata: Metadata = {
  title: "Mai2Link - 游玩记录",
};

export default async function RecordsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mai2link_token")?.value;

  let ssrData: { list: unknown[]; total: number } | null = null;

  if (token) {
    try {
      const res = await playlogGet({ token, start: 0, end: 20 });
      ssrData = { list: res.playlogList ?? [], total: res.total ?? 0 };
    } catch {  }
  }

  // 无数据时填充 demo 记录，展示桌面端布局
  if (!ssrData || ssrData.list.length === 0) {
    const demoRecords = Array.from({ length: 8 }, (_, i) => ({
      musicId: 10000 + i,
      musicTitle: ["Grievous Lady", "FREEDOM DiVE↓", "PANDORA PARADOXXX", "Lumina", "Cthugha", "B.B.K.K.B.K.K.", "Oshama Scramble!", "SILENT BLUE"][i],
      level: (i % 5 + 10) as number,
      achievement: 97.5 + Math.random() * 2,
      deluxscore: 1200000 + Math.floor(Math.random() * 50000),
      totalCombo: 1000 + Math.floor(Math.random() * 500),
      maxCombo: 800 + Math.floor(Math.random() * 300),
      maxSync: Math.floor(Math.random() * 200),
      fastCount: Math.floor(Math.random() * 30),
      lateCount: Math.floor(Math.random() * 30),
      userPlayDate: new Date(Date.now() - i * 3600000).toISOString(),
      placeName: ["新宿ミラノ", "秋叶原GIGO", "池袋アドアーズ", "渋谷OIC"][i % 4],
      placeId: i,
      isDx: i % 2 === 0,
      isClear: i < 7,
      isAchieveNewRecord: i < 2,
      isDeluxscoreNewRecord: i < 2,
      comboStatus: [0, 2, 1, 0, 2, 0, 1, 0][i],
      syncStatus: [0, 1, 0, 0, 2, 0, 0, 1][i],
      beforeRating: 12000 + i * 100,
      afterRating: 12050 + i * 100,
      beforeDeluxRating: 13000,
      afterDeluxRating: 13050,
      playerNum: 1,
      vsMode: 0,
      vsUserName: "",
      vsUserRating: 0,
      vsRank: 0,
    }));
    ssrData = { list: demoRecords, total: 20 };
  }

  return <PlayRecordsScr ssrData={ssrData} />;
}