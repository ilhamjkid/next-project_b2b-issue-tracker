import { Metadata } from "next";
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { ClientUserSettings } from "@/features/users/components/client-user-settings";
import { requireAuth } from "@/lib/access";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function ClientSettingsPage() {
  const user = await requireAuth("CLIENT");

  return (
    <SidebarInset>
      <DashboardHeader role={user.role} title="Profile Settings" />
      <section className="p-4">
        <ClientUserSettings user={user} />
      </section>
    </SidebarInset>
  );
}
