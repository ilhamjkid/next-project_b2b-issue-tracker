"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusAlert } from "@/components/shared/status-alert";
import { handleSignin } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

export function SigninForm({ className, ...props }: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = React.useActionState(handleSignin, undefined);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {state && !state.success && (
        <StatusAlert
          variant="error"
          title="Sign-in failed"
          description={state.message ?? "An error occurred on our server."}
        />
      )}
      <Card>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Enter your email below to sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  key={state?.values?.email ?? "email-input"}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="john.doe@gmail.com"
                  defaultValue={state?.values?.email ?? ""}
                />
                {state?.errors?.email &&
                  state?.errors?.email.map((val) => (
                    <FieldError key={val} className="text-error">
                      {val}
                    </FieldError>
                  ))}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" name="password" />
                {state?.errors?.password &&
                  state?.errors?.password.map((val) => (
                    <FieldError key={val} className="text-error">
                      {val}
                    </FieldError>
                  ))}
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Processing..." : "Sign In"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
