import { Metadata } from "next";
import { CalendarCheck2Icon, ClockIcon, UserMinusIcon } from "lucide-react";
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { StatCard } from "@/components/shared/stat-card";
import { TicketTable } from "@/features/tickets/components/ticket-table";
import { getTickets, getTicketStatsByAgent } from "@/features/tickets/queries";
import { requireAuth } from "@/lib/access";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AgentDashboardPage(props: {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    limit?: string;
    page?: string;
  }>;
}) {
  const user = await requireAuth("AGENT");
  const searchParams = await props.searchParams;
  const search = searchParams?.search ?? "";
  const status = searchParams?.status;
  const priority = searchParams?.priority;
  const limit = Number(searchParams?.limit ?? "5");
  const page = Number(searchParams?.page ?? "1");

  const [ticketStatsResult, ticketsResult] = await Promise.all([
    getTicketStatsByAgent(),
    getTickets({
      output: {
        id: true,
        title: true,
        status: true,
        priority: true,
        created_at: true,
      },
      join: {
        client: { name: true },
        agent: { name: true },
      },
      filter: { status, priority },
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
      label: "Unassigned Tickets",
      count: ticketStatsResult.data.unassignedTickets,
      Icon: UserMinusIcon,
    },
    {
      label: "In Progress",
      count: ticketStatsResult.data.inProgressTickets,
      Icon: ClockIcon,
    },
    {
      label: "Resolved Today",
      count: ticketStatsResult.data.resolvedTodayTickets,
      Icon: CalendarCheck2Icon,
    },
  ];

  return (
    <SidebarInset>
      <DashboardHeader userRole={user.role} title="Overview & Tickets" />
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
