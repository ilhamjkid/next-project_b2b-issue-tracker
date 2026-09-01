import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { requireAuth } from "@/lib/access";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const user = await requireAuth();

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "19rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar
          user={{
            name: user.name,
            email: user.email,
            role: user.role,
          }}
        />
        {children}
      </SidebarProvider>
    </TooltipProvider>
  );
}
