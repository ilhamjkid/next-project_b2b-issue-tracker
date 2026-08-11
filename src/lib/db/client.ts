import postgres from "postgres";
import { env } from "@/env";

// Type definition for global connection instance
const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof postgres> | undefined;
};

// Initialize postgres driver
export const sql =
  globalForDb.conn ??
  postgres(env.DATABASE_URL, {
    ssl: "require",
    max: 10,
  });

if (env.NODE_ENV !== "production") {
  globalForDb.conn = sql;
}
