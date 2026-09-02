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
import { TicketEntity } from "@/features/tickets/types";
import { Prettify } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ClientTicketTable({
  tickets,
  totalTickets,
  className,
  ...props
}: {
  tickets: Prettify<Pick<TicketEntity, "id" | "title" | "status" | "priority" | "created_at">>[];
  totalTickets: number;
} & React.ComponentProps<"div">) {
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
              <TableHead>Created At</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.title}</TableCell>
                  <TableCell>{ticket.status}</TableCell>
                  <TableCell>{ticket.priority}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(ticket.created_at)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/client/tickets/${ticket.id}`}
                      className={buttonVariants({ variant: "secondary", size: "sm" })}
                    >
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-lg text-center p-4">
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
