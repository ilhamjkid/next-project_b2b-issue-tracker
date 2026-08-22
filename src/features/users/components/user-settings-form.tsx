"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusAlert } from "@/components/shared/status-alert";
import { UserEntity } from "@/features/users/types";
import { handleUpdateUser } from "@/features/users/actions";

export function UserSettingsForm({
  user,
  onResetFormState,
  className,
  ...props
}: {
  user: Omit<UserEntity, "password_hash" | "created_at">;
  onResetFormState: () => void;
} & React.ComponentProps<"form">) {
  const [state, formAction, isPending] = React.useActionState(
    handleUpdateUser.bind(null, { userId: user.id }),
    undefined,
  );

  return (
    <form action={formAction} className={cn("flex flex-col gap-6", className)} {...props}>
      {state && !state.success && (
        <StatusAlert
          variant="error"
          title="Update profile failed"
          description={state.message ?? "An error occurred while updating the user profile."}
          className="max-w-full"
        />
      )}
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Update your profile</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to update your profile
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            key={state?.values?.name ?? user.name}
            id="name"
            type="text"
            name="name"
            placeholder="John Doe"
            defaultValue={state?.values?.name ?? user.name}
          />
          {state?.errors?.name &&
            state.errors.name.map((val) => (
              <FieldError key={val} className="text-error">
                {val}
              </FieldError>
            ))}
        </Field>
        <Field>
          <FieldLabel htmlFor="name">Email</FieldLabel>
          <Input
            key={state?.values?.email ?? user.email}
            id="email"
            type="email"
            name="email"
            placeholder="john.doe@gmail.com"
            defaultValue={state?.values?.email ?? user.email}
          />
          {state?.errors?.email &&
            state.errors.email.map((val) => (
              <FieldError key={val} className="text-error">
                {val}
              </FieldError>
            ))}
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Leave blank to keep unchanged"
          />
          {state?.errors?.password &&
            state.errors.password.map((val) => (
              <FieldError key={val} className="text-error">
                {val}
              </FieldError>
            ))}
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Confirm Password</FieldLabel>
          <Input
            id="confirm"
            type="password"
            name="confirm"
            placeholder="Leave blank to keep unchanged"
          />
          {state?.errors?.confirm &&
            state.errors.confirm.map((val) => (
              <FieldError key={val} className="text-error">
                {val}
              </FieldError>
            ))}
        </Field>
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Processing..." : "Update Profile"}
          </Button>
          <Button variant="outline" onClick={onResetFormState} disabled={isPending}>
            {isPending ? "Processing..." : "Reset Values"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
