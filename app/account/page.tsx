export const runtime = "edge";

import type { Metadata } from "next";
import AccountScr from "../screens/account/AccountScr";

export const metadata: Metadata = {
  title: "Mai2Link - 账号",
};

export default function AccountPage() {
  return <AccountScr />;
}