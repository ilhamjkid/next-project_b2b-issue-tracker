import { Metadata } from "next";
import Link from "next/link";
import { SidebarInset } from "@/components/ui/sidebar";
import { buttonVariants } from "@/components/ui/button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { requireAuth } from "@/lib/access";

export const metadata: Metadata = {
  title: "Ticket Detail",
};

export default async function AgentTicketDetailPage(props: {
  params: Promise<{ ticketId: string }>;
}) {
  const user = await requireAuth("AGENT");
  const params = await props.params;
  const ticketId = params.ticketId;

  return (
    <SidebarInset>
      <DashboardHeader userRole={user.role} title={ticketId}>
        <Link href="/agent" className={buttonVariants()}>
          Back to Dashboard
        </Link>
      </DashboardHeader>
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </main>
    </SidebarInset>
  );
}
