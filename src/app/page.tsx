import { sql } from "@/lib/db/client";

export default async function Home() {
  await sql`SELECT 1`;

  return (
    <main className="p-8">
      <h1>B2B Issue Tracker</h1>
    </main>
  );
}
