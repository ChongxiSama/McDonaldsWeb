export const runtime = "edge";

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { usageGet } from "@/lib/mai2link-api";
import AboutScr from "../screens/about/AboutScr";

export const metadata: Metadata = {
  title: "Mai2Link - 关于",
};

export const revalidate = 300;

export default async function AboutPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mai2link_token")?.value;

  let ssrUsage: Record<string, unknown> | null = null;

  if (token) {
    try {
      const res = await usageGet({ token });
      ssrUsage = (res as { usageData?: Record<string, unknown> }).usageData ?? null;
    } catch {  }
  }

  return <AboutScr ssrUsage={ssrUsage} />;
}