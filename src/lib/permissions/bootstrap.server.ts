import type { Sql } from "@/lib/db";
import { env } from "@/lib/env.server";
import { bootstrapProfile } from "../../../scripts/bootstrap.mjs";

/** Verified existing identities only. Offline CLI creates the first credential. */
export async function maybeProvisionFirstAdmin(sql: Sql, userId: string): Promise<void> {
  const email = env("ADMIN_BOOTSTRAP_EMAIL");
  if (!email) return;
  try {
    await sql.transaction((tx) => bootstrapProfile(tx, userId, email));
  } catch (error) {
    if (
      error instanceof Error &&
      ["BOOTSTRAP_CLOSED", "BOOTSTRAP_IDENTITY_DENIED"].includes(error.message)
    )
      return;
    throw error;
  }
}
