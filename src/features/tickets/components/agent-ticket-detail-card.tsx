"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketEntity } from "@/features/tickets/types";
import { UserEntity } from "@/features/users/types";
import { handleUpdateTicketByAgent } from "@/features/tickets/actions";
import { Prettify, UnderscoreToSpace } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const statusItems: {
  label: UnderscoreToSpace<Lowercase<TicketEntity["status"]>, "WITH_CAPITALIZE">;
  value: TicketEntity["status"];
}[] = [
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
] as const;

const priorityItems: {
  label: Capitalize<Lowercase<TicketEntity["priority"]>>;
  value: TicketEntity["priority"];
}[] = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
] as const;

export function AgentTicketDetailCard({
  ticket,
  users,
  className,
  ...props
}: {
  ticket: Prettify<
    Pick<
      TicketEntity,
      "id" | "title" | "description" | "status" | "priority" | "assigned_to_id" | "created_at"
    >
  >;
  users: Prettify<Pick<UserEntity, "id" | "email">[]>;
} & React.ComponentProps<"div">) {
  const [isPending, startTransition] = React.useTransition();
  const userItems = users.map((user) => ({ label: user.email, value: user.id }));
  const selectItems: {
    name: "status" | "priority" | "assigned_to_id";
    placeholder: "Status" | "Priority" | "Assigned To";
    items: typeof statusItems | typeof priorityItems | typeof userItems;
  }[] = [
    { name: "status", placeholder: "Status", items: statusItems },
    { name: "priority", placeholder: "Priority", items: priorityItems },
    { name: "assigned_to_id", placeholder: "Assigned To", items: userItems },
  ];

  const updateTicket = (field: "status" | "priority" | "assigned_to_id", value: string) => {
    startTransition(async () => {
      const payload =
        field === "status"
          ? { ticketId: ticket.id, status: value }
          : field === "priority"
            ? { ticketId: ticket.id, priority: value }
            : field === "assigned_to_id"
              ? { ticketId: ticket.id, assigned_to_id: value }
              : undefined;
      if (!payload) throw new Error("Invalid payload.");

      const updateTicketResult = await handleUpdateTicketByAgent(payload);
      if (!updateTicketResult.success) {
        throw new Error(updateTicketResult.message ?? "Internal Server Error");
      }
    });
  };

  return (
    <Card className={cn(className)} {...props}>
      <CardHeader className="gap-2">
        <CardTitle className="text-2xl">{ticket.title}</CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          {selectItems.map(({ name, placeholder, items }) => (
            <Select
              key={name}
              items={items}
              onValueChange={(value) => {
                if (value) updateTicket(name, value);
              }}
              value={ticket[name]}
              disabled={isPending}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="w-auto">
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ))}
        </div>
        <CardDescription suppressHydrationWarning>
          Created at {formatDate(ticket.created_at)}
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-20 overflow-y-auto scrollbar-none">
        <p className="text-base">{ticket.description}</p>
      </CardContent>
    </Card>
  );
}
