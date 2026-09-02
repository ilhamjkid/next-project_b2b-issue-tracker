import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { getTicket } from "@/features/tickets/queries";
import { requireAuth } from "@/lib/access";
import { cn } from "@/lib/utils";

const comments: {
  id: string;
  content: string;
  is_internal: false;
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
            <CardDescription>Created at {ticket.created_at.toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="max-h-20 overflow-y-auto scrollbar-none">
            <p className="text-base">{ticket.description}</p>
          </CardContent>
        </Card>
        <Separator />
        <div className="min-h-0 flex flex-1 flex-col gap-4">
          <h3 className="text-xl font-semibold">Activity & Comments</h3>
          <div className="flex flex-1 flex-col-reverse gap-4 p-4 border rounded-lg overflow-y-auto scrollbar-none">
            {comments.length > 1 ? (
              comments.reverse().map((comment) => (
                <div
                  key={comment.id}
                  className={cn("max-w-[90%] p-[inherit] border rounded-[inherit] sm:max-w-[80%]", {
                    "bg-secondary ml-auto": comment.user.role === "CLIENT",
                    "bg-card": comment.user.role === "AGENT",
                  })}
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold">{comment.user.name}</h4>
                      <Badge>{comment.user.role}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {comment.created_at.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-1 flex-col justify-center items-center gap-2">
                <MessageSquare className="w-16 h-16 text-warning" />
                <h4 className="text-base">No comments yet</h4>
              </div>
            )}
          </div>
          <form className="flex items-stretch gap-2">
            <Textarea
              placeholder="Write your comment here..."
              className="min-h-0 max-h-[40.5px] break-all resize-none scrollbar-none"
              aria-invalid={false}
            />
            <Button type="submit" size="lg" className="font-semibold">
              SEND
            </Button>
          </form>
        </div>
      </section>
    </SidebarInset>
  );
}
