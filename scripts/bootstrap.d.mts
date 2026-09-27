import type { QueryDatabase } from "./operations.mjs";
export function bootstrapProfile(
  tx: QueryDatabase,
  userId: string,
  bootstrapEmail: string,
): Promise<void>;
