import postgres from "postgres";
import bcrypt from "bcryptjs";

const sql = postgres(process.env.DIRECT_URL!, { ssl: "require" });

export async function seed() {
  try {
    console.log("[DATABASE] Seeding started.");

    // 1. Clean existing data
    await sql`TRUNCATE comments, tickets, users CASCADE`;
    console.log("[DATABASE] Clean existing data successfull.");

    // 2. Insert 5 Users
    const passwordHash = await bcrypt.hash("#Password123", 10);
    const users = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES 
        ('Alice Client', 'client1@example.com', ${passwordHash}, 'CLIENT'),
        ('Bob Client', 'client2@example.com', ${passwordHash}, 'CLIENT'),
        ('Charlie Client', 'client3@example.com', ${passwordHash}, 'CLIENT'),
        ('David Agent', 'agent1@example.com', ${passwordHash}, 'AGENT'),
        ('Emma Agent', 'agent2@example.com', ${passwordHash}, 'AGENT')
      RETURNING id, name, role;
    `;
    console.log("[DATABASE] Insert 5 Users successfull.");

    const client1 = users.find((u) => u.name === "Alice Client")!;
    const client2 = users.find((u) => u.name === "Bob Client")!;
    const client3 = users.find((u) => u.name === "Charlie Client")!;
    const agent1 = users.find((u) => u.name === "David Agent")!;
    const agent2 = users.find((u) => u.name === "Emma Agent")!;

    // 3. Insert 10 Tickets
    const tickets = await sql`
      INSERT INTO tickets (description, title, status, priority, created_by_id, assigned_to_id)
      VALUES 
        ( 'User receives a 500 internal server error when attempting to authenticate with Google.',
          'Failed to login via Google OAuth', 'OPEN', 'HIGH', ${client1.id}, NULL ),
        ( 'Automatic discounts fail to apply correctly during the flash sale event.',
          'Checkout error during promotional campaign', 'IN_PROGRESS', 'HIGH', ${client2.id}, ${agent1.id} ),
        ( 'Images in WEBP format are rejected by the server during upload.',
          'Profile picture upload failing', 'OPEN', 'LOW', ${client3.id}, NULL ),
        ( 'Downloaded PDF files cannot be opened in standard PDF readers.',
          'Exported PDF transaction report is corrupt', 'CLOSED', 'MEDIUM', ${client1.id}, ${agent2.id} ),
        ( 'Newly registered users do not receive activation emails in inbox or spam.',
          'Verification email not delivered', 'OPEN', 'HIGH', ${client2.id}, NULL ),
        ( 'Data tables overflow the viewport on screens narrower than 375px.',
          'Dashboard UI layout broken on mobile devices', 'IN_PROGRESS', 'MEDIUM', ${client3.id}, ${agent1.id} ),
        ( 'Loading historical data page takes more than 8 seconds to resolve.',
          'Slow query execution on transaction history', 'OPEN', 'HIGH', ${client1.id}, NULL ),
        ( 'Webhook notifications from the payment provider consistently fail to process.',
          'Payment gateway integration timeout', 'RESOLVED', 'HIGH', ${client2.id}, ${agent2.id} ),
        ( 'Security tokens expire prematurely before users can access the reset URL.',
          'Password reset feature unresponsive', 'CLOSED', 'HIGH', ${client3.id}, ${agent1.id} ),
        ( 'Feature request to allow users to specify custom date intervals for analytics.',
          'Add custom date range filter to reports', 'OPEN', 'LOW', ${client1.id}, NULL )
      RETURNING id, title;
    `;
    console.log("[DATABASE] Insert 10 Tickets successfull.");

    const ticket1 = tickets.find((t) => t.title === "Failed to login via Google OAuth")!;
    const ticket2 = tickets.find((t) => t.title === "Checkout error during promotional campaign")!;
    const ticket5 = tickets.find((t) => t.title === "Verification email not delivered")!;
    const ticket7 = tickets.find((t) => t.title === "Slow query execution on transaction history")!;
    const ticket10 = tickets.find((t) => t.title === "Add custom date range filter to reports")!;

    // 4. Insert 15 Comments
    await sql`
      INSERT INTO comments (ticket_id, user_id, is_internal, content)
      VALUES 
        ( ${ticket1.id}, ${agent1.id}, FALSE,
          'Have you attempted to reproduce this issue in the staging environment?' ),
        ( ${ticket1.id}, ${client1.id}, FALSE,
          'Yes, the error only triggers if the user email contains special characters.' ),
        ( ${ticket1.id}, ${agent1.id}, TRUE,
          'Internal note: Check the JWT parsing logic for Google OAuth tokens.' ),
        ( ${ticket2.id}, ${agent2.id}, FALSE,
          'Could you provide server log snippets from the exact timestamp of the transaction?' ),
        ( ${ticket2.id}, ${client2.id}, FALSE,
          'Server logs attached. Trace ID reference: #9901.' ),
        ( ${ticket2.id}, ${agent1.id}, TRUE,
          'Internal note: Verify Midtrans payment gateway webhook response headers.' ),
        ( ${ticket5.id}, ${client2.id}, FALSE,
          'Still no email received after clicking resend twice.' ),
        ( ${ticket5.id}, ${agent2.id}, TRUE,
          'Internal note: SMTP outbound queue appears backed up since 09:00 AM.' ),
        ( ${ticket5.id}, ${agent2.id}, FALSE,
          'We have restarted the mail delivery worker service and identified the bottleneck.' ),
        ( ${ticket7.id}, ${agent1.id}, FALSE,
          'Investigating database execution plans. Index on created_at might be missing.' ),
        ( ${ticket7.id}, ${agent1.id}, TRUE,
          'Internal note: Running EXPLAIN ANALYZE on history query with 100k rows.' ),
        ( ${ticket7.id}, ${client1.id}, FALSE,
          'Thanks for the update, let us know if additional account details are needed.' ),
        ( ${ticket10.id}, ${agent2.id}, FALSE,
          'Feature request logged and prioritized for the upcoming sprint release.' ),
        ( ${ticket10.id}, ${client1.id}, FALSE,
          'Great, looking forward to seeing this feature in the dashboard.' ),
        ( ${ticket10.id}, ${agent2.id}, TRUE,
          'Internal note: UI mockup design for date picker component attached in Figma.' );
    `;
    console.log("[DATABASE] Insert 15 Comments successfull.");

    console.log("[DATABASE] Seeding completed.");
  } catch (error) {
    console.error("[DATABASE] Seeding failed.", error);
  } finally {
    await sql.end();
  }
}

seed();
