import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TicketFilter } from "@/features/tickets/components/ticket-filter";
import { TicketPagination } from "@/features/tickets/components/ticket-pagination";
import { TicketEntity, TicketJoinUserEntity } from "@/features/tickets/types";
import { Prettify } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type ClientTicketTableProps = {
  userRole: "CLIENT";
  tickets: Prettify<Pick<TicketEntity, "id" | "title" | "status" | "priority" | "created_at">>[];
  totalTickets: number;
} & React.ComponentProps<"div">;

type AgentTicketTableProps = {
  userRole: "AGENT";
  tickets: Prettify<
    Pick<TicketEntity, "id" | "title" | "status" | "priority" | "created_at"> & {
      client: Pick<TicketJoinUserEntity["client"], "name">;
      agent: Pick<NonNullable<TicketJoinUserEntity["agent"]>, "name"> | null;
    }
  >[];
  totalTickets: number;
} & React.ComponentProps<"div">;

export function TicketTable({
  userRole,
  tickets,
  totalTickets,
  className,
  ...props
}: ClientTicketTableProps | AgentTicketTableProps) {
  return (
    <Card className={cn(className)} {...props}>
      <CardHeader>
        <TicketFilter />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              {userRole === "AGENT" && (
                <>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created By</TableHead>
                </>
              )}
              <TableHead>Created At</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length > 0 ? (
              tickets.map((ticket, index) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium truncate">{ticket.title}</TableCell>
                  <TableCell>{ticket.status}</TableCell>
                  <TableCell>{ticket.priority}</TableCell>
                  {userRole === "AGENT" && (
                    <>
                      <TableCell>{tickets[index].agent?.name ?? "-"}</TableCell>
                      <TableCell>{tickets[index].client.name}</TableCell>
                    </>
                  )}

                  <TableCell>{formatDate(ticket.created_at)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/${userRole.toLowerCase()}/tickets/${ticket.id}`}
                      className={buttonVariants({ variant: "secondary", size: "sm" })}
                    >
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={userRole === "AGENT" ? 7 : 5}
                  className="text-lg text-center p-4"
                >
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {totalTickets > 0 && (
        <CardFooter>
          <TicketPagination totalTickets={totalTickets} />
        </CardFooter>
      )}
    </Card>
  );
}
