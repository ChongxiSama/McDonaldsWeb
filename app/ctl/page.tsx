
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getM2lctlHealthMai2Link, m2lCtlIPCConfigGet } from "@/lib/mai2link-api";
import CtlScr from "../components/ctlScr";

export const metadata: Metadata = {
  title: "Mai2Link - 机台控制",
};

export default async function CtlPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mai2link_token")?.value;

  let ssrHealth: unknown = null;
  let ssrConfigs: Record<string, string> = {};

  if (token) {
    try {
      ssrHealth = await getM2lctlHealthMai2Link({ token });
    } catch { console.warn("failed to get health"); }
    try {
      const res = await m2lCtlIPCConfigGet({ token });
      ssrConfigs = res.configs;
    } catch { console.warn("failed to get configs"); }
  }

  return <CtlScr ssrHealth={ssrHealth as Record<string, unknown> | null} ssrConfigs={ssrConfigs} />;
}