"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusAlert } from "@/components/shared/status-alert";
import { SetUserActiveDialog, UserActiveDialog, UserEntity } from "@/features/users/types";
import { handleDeleteUser } from "@/features/users/actions";

export function UserDeleteDialog({
  activeDialog,
  setActiveDialog,
  userId,
  userEmail,
  button,
}: {
  activeDialog: UserActiveDialog;
  setActiveDialog: SetUserActiveDialog;
  userId: UserEntity["id"];
  userEmail: UserEntity["email"];
  button: React.ReactElement;
}) {
  const [state, formAction, isPending] = React.useActionState(
    handleDeleteUser.bind(null, { userId }),
    undefined,
  );

  const open = activeDialog.type === "DELETE" && activeDialog.id === userId;
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (newOpen) return setActiveDialog({ type: "DELETE", id: userId });

      if (open) setActiveDialog({ type: undefined, id: undefined });
    },
    [open, setActiveDialog, userId],
  );

  React.useEffect(() => {
    if (state && state.success) handleOpenChange(false);
  }, [state, handleOpenChange]);

  const formId = `delete-user-form-by-id-${userId}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={button} />
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-sm max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {state && !state.success && (
          <StatusAlert
            variant="error"
            title="Delete account failed"
            description={state.message ?? "An error occurred on our server."}
          />
        )}
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            Delete this account and all associated data permanently
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} id={formId}>
          <p className="text-lg">Are you sure you want to delete account with email {userEmail}?</p>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button type="submit" form={formId} disabled={isPending} variant="destructive">
            {isPending ? "Processing..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
