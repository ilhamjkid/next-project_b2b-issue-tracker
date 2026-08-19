"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";

type ActiveDialog =
  | { type?: undefined; id?: undefined }
  | { type: "CREATE"; id?: undefined }
  | { type: "UPDATE" | "DELETE"; id: string };

export function AgentUserHeader({ userRole }: { userRole: "CLIENT" | "AGENT" }) {
  const [activeDialog, setActiveDialog] = React.useState<ActiveDialog>({
    type: undefined,
    id: undefined,
  });

  return (
    <DashboardHeader role={userRole} title="User Management">
      {activeDialog.type === "CREATE" ? (
        <UserFormDialog
          activeDialog={activeDialog}
          setActiveDialog={setActiveDialog}
          mode="CREATE"
          button={<Button className="font-semibold">Add New User</Button>}
        />
      ) : (
        <Button
          onClick={() => setActiveDialog({ type: "CREATE", id: undefined })}
          className="font-semibold"
        >
          Add New User
        </Button>
      )}
    </DashboardHeader>
  );
}
