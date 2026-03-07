import { reserveIdempotencyKey } from "@zevlin/db";

export async function claimIdempotencyKey(key: string, operation: string): Promise<boolean> {
  return reserveIdempotencyKey(key, operation);
}
