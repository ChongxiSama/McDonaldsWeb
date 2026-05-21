"use server";

import { revalidateTag } from "next/cache";

export async function revalidateUserData() {
  revalidateTag("user-data", { expire: 0 });
  revalidateTag("records", { expire: 0 });
}
