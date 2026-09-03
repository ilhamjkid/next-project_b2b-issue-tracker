import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { SidebarInset } from "@/components/ui/sidebar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { TicketCommentList } from "@/features/tickets/components/ticket-comment-list";
import { ClientTicketCommentForm } from "@/features/tickets/components/client-ticket-comment-form";
import { getTicket } from "@/features/tickets/queries";
import { requireAuth } from "@/lib/access";
import { cn, formatDate } from "@/lib/utils";

const comments: {
  id: string;
  content: string;
  user: {
    name: string;
    role: "AGENT" | "CLIENT";
  };
  created_at: Date;
}[] = [];

export const metadata: Metadata = {
  title: "Ticket Details",
};

export default async function ClientTicketDetailPage(props: {
  params: Promise<{ ticketId: string }>;
}) {
  const user = await requireAuth("CLIENT");
  const params = await props.params;
  const ticketResult = await getTicket({
    output: {
      title: true,
      description: true,
      status: true,
      priority: true,
      created_at: true,
    },
    join: null,
    filter: { id: params.ticketId, created_by_id: user.id },
  });
  if (!ticketResult.success) {
    if (ticketResult.message === "Ticket data not found.") return notFound();

    throw new Error(ticketResult.message ?? "Internal Server Error");
  }

  const { data: ticket } = ticketResult;

  return (
    <SidebarInset className="h-screen">
      <DashboardHeader userRole={user.role} title="Ticket Details">
        <Link href="/client" className={buttonVariants()}>
          Back to Dashboard
        </Link>
      </DashboardHeader>
      <section className="min-h-0 flex flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-2xl">{ticket.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  className={cn({
                    "bg-info text-info-foreground": ticket.status === "OPEN",
                    "bg-warning text-warning-foreground": ticket.status === "IN_PROGRESS",
                    "bg-success text-success-foreground": ticket.status === "RESOLVED",
                    "bg-muted text-muted-foreground": ticket.status === "CLOSED",
                  })}
                >
                  {ticket.status}
                </Badge>
                <Badge
                  className={cn({
                    "bg-muted text-muted-foreground": ticket.priority === "LOW",
                    "bg-warning text-warning-foreground": ticket.priority === "MEDIUM",
                    "bg-error text-error-foreground": ticket.priority === "HIGH",
                  })}
                >
                  {ticket.priority}
                </Badge>
              </div>
            </div>
            <CardDescription>Created at {formatDate(ticket.created_at)}</CardDescription>
          </CardHeader>
          <CardContent className="max-h-20 overflow-y-auto scrollbar-none">
            <p className="text-base">{ticket.description}</p>
          </CardContent>
        </Card>
        <Separator />
        <div className="min-h-0 flex flex-1 flex-col gap-4">
          <h3 className="text-xl font-semibold">Activity & Comments</h3>
          <TicketCommentList userRole={user.role} comments={comments} />
          <ClientTicketCommentForm />
        </div>
      </section>
    </SidebarInset>
  );
}
