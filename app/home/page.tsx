export const runtime = "edge";

import type { Metadata } from "next";
import { cookies } from "next/headers";
import HomeScr from "../screens/home/HomeScr";
import { playlogGet, aimeDBRegTemp, m2lIdGet } from "@/lib/mai2link-api";

export const metadata: Metadata = {
  title: "Mai2Link - 概览",
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mai2link_token")?.value;
  const isMachine = cookieStore.get("mai2link_is_machine")?.value === "1";

  let initialData: Record<string, unknown> = {};

  if (token) {
    try {
      const [playlogRes, qrRes] = await Promise.allSettled([
        playlogGet({ token, start: 0, end: 50 }).catch(() => null),
        aimeDBRegTemp({ token }).catch(() => null),
      ]);

      const playlog = playlogRes.status === "fulfilled" ? playlogRes.value : null;
      const qr = qrRes.status === "fulfilled" ? qrRes.value : null;

      let m2lData = null;
      try { m2lData = await m2lIdGet({ token }); } catch { }

      initialData = {
        playlogList: playlog?.playlogList ?? [],
        qrAccessCode: qr?.accessCode ?? "",
        m2lId: m2lData?.m2lId ?? "",
        userId: m2lData?.userId ?? "",
        isMachine,
      };
    } catch { }
  }

  return <HomeScr ssrData={initialData} />;
}
