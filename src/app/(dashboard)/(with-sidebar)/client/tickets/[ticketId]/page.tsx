import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { SidebarInset } from "@/components/ui/sidebar";
import { buttonVariants } from "@/components/ui/button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { getTicket } from "@/features/tickets/queries";
import { requireAuth } from "@/lib/access";

export const metadata: Metadata = {
  title: "Ticket Details",
};

export default async function ClientTicketDetailPage(props: {
  params: Promise<{ ticketId: string }>;
}) {
  const user = await requireAuth("CLIENT");
  const params = await props.params;
  const ticketResult = await getTicket({
    output: { title: true },
    join: null,
    filter: { id: params.ticketId, created_by_id: user.id },
  });
  if (!ticketResult.success) {
    if (ticketResult.message === "Ticket data not found.") return notFound();

    throw new Error(ticketResult.message ?? "Internal Server Error");
  }

  const { data: ticket } = ticketResult;

  return (
    <SidebarInset>
      <DashboardHeader userRole={user.role} title={ticket.title}>
        <Link href="/client" className={buttonVariants()}>
          Back to Dashboard
        </Link>
      </DashboardHeader>
      <section className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </section>
    </SidebarInset>
  );
}
