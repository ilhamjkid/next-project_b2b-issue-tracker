"use client";

import { useActionState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StatusAlert } from "@/components/shared/status-alert";
import { signin } from "@/features/auth/actions";

export function SigninForm({ className, ...props }: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(signin, undefined);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {state?.success === false && (
        <StatusAlert variant="error" title="Sign-in failed" description={state.message} />
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
                  placeholder="john@doe.com"
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
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
