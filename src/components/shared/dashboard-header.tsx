import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function DashboardHeader({
  role,
  title,
  children,
}: {
  role: "CLIENT" | "AGENT";
  title: string;
  children?: React.ReactNode;
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
          <h2 className="text-xl text-info font-semibold">{role}</h2>
          <h2 className="text-lg font-medium">{title}</h2>
        </div>
        {children}
      </div>
    </header>
  );
}
