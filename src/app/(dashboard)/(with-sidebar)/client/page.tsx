import { Metadata } from "next";
import { CheckCircle2Icon, CircleDotIcon, TicketsIcon } from "lucide-react";
import { SidebarInset } from "@/components/ui/sidebar";
import { ClientTicketHeader } from "@/features/tickets/components/client-ticket-header";
import { StatCard } from "@/components/shared/stat-card";
import { TicketTable } from "@/features/tickets/components/ticket-table";
import { getTickets, getTicketStatsByClient } from "@/features/tickets/queries";
import { requireAuth } from "@/lib/access";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function ClientDashboardPage(props: {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    limit?: string;
    page?: string;
  }>;
}) {
  const user = await requireAuth("CLIENT");
  const searchParams = await props.searchParams;
  const search = searchParams?.search ?? "";
  const status = searchParams?.status;
  const priority = searchParams?.priority;
  const limit = Number(searchParams?.limit ?? "5");
  const page = Number(searchParams?.page ?? "1");

  const [ticketStatsResult, ticketsResult] = await Promise.all([
    getTicketStatsByClient({ clientUserId: user.id }),
    getTickets({
      output: {
        id: true,
        title: true,
        status: true,
        priority: true,
        created_at: true,
      },
      join: null,
      filter: {
        created_by_id: user.id,
        status,
        priority,
      },
      search: {
        fields: ["title", "description"],
        keyword: search,
      },
      pagination: { limit, page },
    }),
  ]);
  if (!ticketStatsResult.success) {
    throw new Error(ticketStatsResult.message ?? "Internal Server Error");
  }
  if (!ticketsResult.success) {
    throw new Error(ticketsResult.message ?? "Internal Server Error");
  }

  const stats = [
    {
      label: "Total Tickets",
      count: ticketStatsResult.data.totalTickets,
      Icon: TicketsIcon,
    },
    {
      label: "Open Tickets",
      count: ticketStatsResult.data.openTickets,
      Icon: CircleDotIcon,
    },
    {
      label: "Resolved Tickets",
      count: ticketStatsResult.data.resolvedTickets,
      Icon: CheckCircle2Icon,
    },
  ];

  return (
    <SidebarInset>
      <ClientTicketHeader userRole={user.role} />
      <section className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
        <TicketTable
          userRole={user.role}
          tickets={ticketsResult.data.data}
          totalTickets={ticketsResult.data.total}
        />
      </section>
    </SidebarInset>
  );
}
