import { getSql } from "@/lib/db";
import { persistInquiry } from "../../../scripts/operations.mjs";
export async function saveInquiry(data: unknown): Promise<string> {
  return persistInquiry(await getSql(), data);
}
