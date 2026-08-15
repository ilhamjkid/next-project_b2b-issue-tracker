import postgres from "postgres";
import bcrypt from "bcryptjs";

const sql = postgres(process.env.DIRECT_URL!, { ssl: "require" });

async function seed() {
  try {
    console.log("DATABASE SEEDING STARTED.");

    const passwordHash = await bcrypt.hash("#Password123", 10);

    const users = await sql<{ name: string; email: string; role: "CLIENT" | "AGENT" }[]>`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Demo Agent', 'agent@demo.com', ${passwordHash}, 'AGENT'),
      ('Demo Client', 'client@demo.com', ${passwordHash}, 'CLIENT')
      ON CONFLICT (email) DO NOTHING RETURNING name, email, role;
    `;
    if (users.length === 0) {
      console.log(`DATA: 'Demo Client'-'client@demo.com'-'CLIENT' ALREADY EXISTS.`);
      console.log(`DATA: 'Demo Agent'-'agent@demo.com'-'AGENT' ALREADY EXISTS.`);
    } else if (users.length === 1) {
      if (users[0].role === "CLIENT") {
        console.log(`DATA: 'Demo Client'-'client@demo.com'-'CLIENT' SUCCESSFULLY CREATED.`);
        console.log(`DATA: 'Demo Agent'-'agent@demo.com'-'AGENT' ALREADY EXISTS.`);
      } else {
        console.log(`DATA: 'Demo Client'-'client@demo.com'-'CLIENT' ALREADY EXISTS.`);
        console.log(`DATA: 'Demo Agent'-'agent@demo.com'-'AGENT' SUCCESSFULLY CREATED.`);
      }
    } else {
      console.log(`DATA: 'Demo Client'-'client@demo.com'-'CLIENT' SUCCESSFULLY CREATED.`);
      console.log(`DATA: 'Demo Agent'-'agent@demo.com'-'AGENT' SUCCESSFULLY CREATED.`);
    }

    console.log("DATABASE SEEDING COMPLETED.");
  } catch (error) {
    console.error("DATABASE SEEDING FAILED.", error);
  } finally {
    await sql.end();
  }
}

seed();
