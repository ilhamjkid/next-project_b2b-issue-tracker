import { Metadata } from "next";
import { Inbox } from "lucide-react";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { AgentUserHeader } from "@/features/users/components/agent-user-header";
import { UserTable } from "@/features/users/components/user-table";
import { getUsers } from "@/features/users/queries";
import { requireAuth } from "@/lib/access";

export const metadata: Metadata = {
  title: "Manage Users",
};

export default async function AgentManageUsersPage() {
  const user = await requireAuth("AGENT");
  const userResult = await getUsers({
    output: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
  });
  if (!userResult.success) {
    throw new Error(userResult.message ?? "Internal Server Error");
  }

  const { data: users } = userResult;

  return (
    <SidebarInset>
      <AgentUserHeader userRole={user.role} />
      <section className="p-4">
        {users.length > 0 ? (
          <Card>
            <CardContent>
              <UserTable users={users} />
            </CardContent>
          </Card>
        ) : (
          <div className="text-center">
            <Inbox className="w-20 h-20 text-warning mx-auto mb-4" />
            <h2 className="text-3xl mb-2">Empty user</h2>
            <p className="text-muted-foreground text-lg">User account empty. Add one.</p>
          </div>
        )}
      </section>
    </SidebarInset>
  );
}
