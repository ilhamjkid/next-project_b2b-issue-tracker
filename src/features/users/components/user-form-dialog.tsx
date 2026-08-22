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
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusAlert } from "@/components/shared/status-alert";
import { SetUserActiveDialog, UserActiveDialog, UserEntity } from "@/features/users/types";
import { handleCreateUser, handleUpdateUser } from "@/features/users/actions";

type CreateUserFormDialogProps = {
  activeDialog: UserActiveDialog;
  setActiveDialog: SetUserActiveDialog;
  mode: "CREATE";
  userId?: undefined;
  defaultValues?: undefined;
  button: React.ReactElement;
};
type UpdateUserFormDialogProps = {
  activeDialog: UserActiveDialog;
  setActiveDialog: SetUserActiveDialog;
  mode: "UPDATE";
  userId: string;
  defaultValues: Omit<UserEntity, "password_hash" | "created_at">;
  button: React.ReactElement;
};

const roleItems = [
  { label: "Client", value: "CLIENT" },
  { label: "Agent", value: "AGENT" },
] as const;

export function UserFormDialog({
  activeDialog,
  setActiveDialog,
  mode,
  userId,
  defaultValues,
  button,
}: CreateUserFormDialogProps | UpdateUserFormDialogProps) {
  const [state, formAction, isPending] = React.useActionState(
    mode === "CREATE" ? handleCreateUser : handleUpdateUser.bind(null, { userId }),
    undefined,
  );

  const open =
    (activeDialog.type === "CREATE" && mode === "CREATE") ||
    (activeDialog.type === "UPDATE" && activeDialog.id === userId && mode === "UPDATE");
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        if (mode === "CREATE") return setActiveDialog({ type: "CREATE" });
        else return setActiveDialog({ type: "UPDATE", id: userId });
      }

      if (open) setActiveDialog({ type: undefined, id: undefined });
    },
    [mode, open, setActiveDialog, userId],
  );

  React.useEffect(() => {
    if (state && state.success) handleOpenChange(false);
  }, [state, handleOpenChange]);

  const formId = mode === "CREATE" ? `create-user-form` : `update-user-form-by-id-${userId}`;

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
            title={mode === "CREATE" ? "Create account failed" : "Update account failed"}
            description={
              state.message
                ? state.message
                : mode === "CREATE"
                  ? "An error occurred while creating the user account."
                  : "An error occurred while updating the user account."
            }
          />
        )}
        <DialogHeader>
          <DialogTitle>{mode === "CREATE" ? "Create" : "Update"} account</DialogTitle>
          <DialogDescription>
            {mode === "CREATE"
              ? "Enter user information below to create new account"
              : "Update your account information below"}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} id={formId}>
          <FieldGroup>
            <Field>
              <Label htmlFor="name">Full Name</Label>
              <Input
                key={state?.values?.name ?? defaultValues?.name ?? "name-input"}
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                defaultValue={state?.values?.name ?? defaultValues?.name ?? ""}
              />
              {state?.errors?.name &&
                state?.errors?.name.map((val) => (
                  <FieldError key={val} className="text-error">
                    {val}
                  </FieldError>
                ))}
            </Field>
            <Field>
              <Label htmlFor="email">Email address</Label>
              <Input
                key={state?.values?.email ?? defaultValues?.email ?? "email-input"}
                id="email"
                type="email"
                name="email"
                placeholder="john.doe@gmail.com"
                defaultValue={state?.values?.email ?? defaultValues?.email ?? ""}
              />
              {state?.errors?.email &&
                state?.errors?.email.map((val) => (
                  <FieldError key={val} className="text-error">
                    {val}
                  </FieldError>
                ))}
            </Field>
            <Field>
              <Label htmlFor="role">Role</Label>
              <Select
                key={state?.values?.role ?? defaultValues?.role ?? "role-select"}
                id="role"
                name="role"
                items={roleItems}
                defaultValue={state?.values?.role ?? defaultValues?.role ?? "CLIENT"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roleItems.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {state?.errors?.role &&
                state?.errors?.role.map((val) => (
                  <FieldError key={val} className="text-error">
                    {val}
                  </FieldError>
                ))}
            </Field>
            <Field>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder={mode === "UPDATE" ? "Leave blank to keep unchanged" : undefined}
              />
              {state?.errors?.password &&
                state?.errors?.password.map((val) => (
                  <FieldError key={val} className="text-error">
                    {val}
                  </FieldError>
                ))}
            </Field>
            <Field>
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                name="confirm"
                placeholder={mode === "UPDATE" ? "Leave blank to keep unchanged" : undefined}
              />
              {state?.errors?.confirm &&
                state?.errors?.confirm.map((val) => (
                  <FieldError key={val} className="text-error">
                    {val}
                  </FieldError>
                ))}
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? "Processing..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
