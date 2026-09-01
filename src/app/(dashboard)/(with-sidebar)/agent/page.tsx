import { Metadata } from "next";
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { requireAuth } from "@/lib/access";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AgentDashboardPage() {
  const user = await requireAuth("AGENT");

  return (
    <SidebarInset>
      <DashboardHeader userRole={user.role} title="Overview & Tickets" />
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
