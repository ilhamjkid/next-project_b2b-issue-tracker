import { redirect, RedirectType } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  if (!session) return redirect("/signin", RedirectType.replace);

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "19rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar user={session.user} />
        {children}
      </SidebarProvider>
    </TooltipProvider>
  );
}
