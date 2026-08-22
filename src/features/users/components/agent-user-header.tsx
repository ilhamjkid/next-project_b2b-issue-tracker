"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { UserActiveDialog, UserEntity } from "@/features/users/types";

export function AgentUserHeader({ userRole }: { userRole: UserEntity["role"] }) {
  const [activeDialog, setActiveDialog] = React.useState<UserActiveDialog>({
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
