import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function DashboardHeader({
  userRole,
  dashboardTitle,
  actionButton,
}: {
  userRole: "CLIENT" | "AGENT";
  dashboardTitle: string;
  actionButton?: React.ReactNode;
}) {
  return (
    <header className="flex min-h-18 shrink-0 items-center gap-2 p-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
      <div className="w-full flex flex-wrap justify-between items-center gap-2 ">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl text-info font-semibold">{userRole}</h2>
          <h2 className="text-lg font-medium">{dashboardTitle}</h2>
        </div>
        {actionButton}
      </div>
    </header>
  );
}
