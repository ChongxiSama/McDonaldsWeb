"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthCookie } from "@/lib/auth-cookie";
import { getActiveUser, getActiveMachine, addAccount, setActiveUser, setActiveMachine } from "@/lib/auth-storage";
import UserHomeScr from "./UserHomeScr";

export default function HomeScr({ ssrData }: { ssrData?: Record<string, unknown> }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    let user = getActiveUser();
    let machine = getActiveMachine();
    if (!user && !machine) {
      const auth = getAuthCookie();
      if (auth?.token) {
        const acc = addAccount(auth.token, auth.isMachine, auth.isMachine ? "机台账号" : "用户账号");
        if (auth.isMachine) setActiveMachine(acc.id); else setActiveUser(acc.id);
        user = getActiveUser();
        machine = getActiveMachine();
      }
    }
    if (!user && !machine) {
      router.replace("/account");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return <UserHomeScr ssrData={ssrData} />;
}