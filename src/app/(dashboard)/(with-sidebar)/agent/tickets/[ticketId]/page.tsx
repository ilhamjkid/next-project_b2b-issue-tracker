import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { SidebarInset } from "@/components/ui/sidebar";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { AgentTicketDetailCard } from "@/features/tickets/components/agent-ticket-detail-card";
import { CommentList } from "@/features/comments/components/comment-list";
import { AgentCommentForm } from "@/features/comments/components/agent-comment-form";
import { getTicket } from "@/features/tickets/queries";
import { getUsers } from "@/features/users/queries";
import { getComments } from "@/features/comments/queries";
import { requireAuth } from "@/lib/access";

export const metadata: Metadata = {
  title: "Ticket Details",
};

export default async function AgentTicketDetailPage(props: {
  params: Promise<{ ticketId: string }>;
}) {
  const user = await requireAuth("AGENT");
  const params = await props.params;

  const [ticketResult, usersResult] = await Promise.all([
    getTicket({
      output: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        assigned_to_id: true,
        created_at: true,
      },
      join: null,
      filter: { id: params.ticketId },
    }),
    getUsers({
      output: { id: true, email: true },
      filter: { role: "AGENT" },
    }),
  ]);
  if (!ticketResult.success) {
    if (ticketResult.message === "Ticket data not found.") return notFound();

    throw new Error(ticketResult.message ?? "Internal Server Error");
  }
  if (!usersResult.success) {
    throw new Error(usersResult.message ?? "Internal Server Error");
  }
  const { data: ticket } = ticketResult;
  const { data: users } = usersResult;

  const commentsResult = await getComments({
    output: { id: true, content: true, created_at: true },
    join: { user: { name: true, role: true } },
    filter: { ticket_id: ticket.id },
  });
  if (!commentsResult.success) {
    throw new Error(commentsResult.message ?? "Internal Server Error");
  }
  const { data: comments } = commentsResult;

  return (
    <SidebarInset className="h-screen">
      <DashboardHeader userRole={user.role} title="Ticket Details">
        <Link href="/agent" className={buttonVariants()}>
          Back to Dashboard
        </Link>
      </DashboardHeader>
      <section className="min-h-0 flex flex-1 flex-col gap-4 p-4">
        <AgentTicketDetailCard ticket={ticket} users={users} />
        <Separator />
        <div className="min-h-0 flex flex-1 flex-col gap-4">
          <h3 className="text-xl font-semibold">Activity & Comments</h3>
          <CommentList userRole={user.role} comments={comments} />
          <AgentCommentForm ticketId={ticket.id} />
        </div>
      </section>
    </SidebarInset>
  );
}
