import postgres from "postgres";
import { env } from "@/env";

// Type definition for global connection instance
const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof postgres> | undefined;
};

/**
 * Shared Postgres client instance initialized with maximum connection pooling limits and mandatory SSL encryption.
 * In development mode, it leverages the `globalThis` scope to persist a single client instance
 * across hot-reloading events, preventing continuous database connection pool exhaustion.
 */
export const sql =
  globalForDb.conn ??
  postgres(env.DATABASE_URL, {
    ssl: "require",
    max: 10,
  });

if (env.NODE_ENV !== "production") {
  globalForDb.conn = sql;
}
