"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { CreateTicketFormDialog } from "@/features/tickets/components/create-ticket-form-dialog";
import { UserEntity } from "@/features/users/types";

export function ClientTicketHeader({ userRole }: { userRole: UserEntity["role"] }) {
  const [isCreateTicketDialogActive, setIsCreateTicketDialogActive] =
    React.useState<boolean>(false);

  return (
    <DashboardHeader userRole={userRole} title="My Tickets">
      {isCreateTicketDialogActive ? (
        <CreateTicketFormDialog
          userId={userRole}
          isCreateTicketDialogActive={isCreateTicketDialogActive}
          setIsCreateTicketDialogActive={setIsCreateTicketDialogActive}
          button={<Button>Create Ticket</Button>}
        />
      ) : (
        <Button onClick={() => setIsCreateTicketDialogActive(true)}>Create Ticket</Button>
      )}
    </DashboardHeader>
  );
}
