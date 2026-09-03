import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketEntity } from "@/features/tickets/types";
import { Prettify } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function ClientTicketDetailCard({
  ticket,
}: {
  ticket: Prettify<
    Pick<TicketEntity, "title" | "description" | "status" | "priority" | "created_at">
  >;
}) {
  return (
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
  );
}
