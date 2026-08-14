"use client";

import { useActionState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StatusAlert } from "@/components/shared/status-alert";
import { signup } from "@/features/auth/actions";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(signup, undefined);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {state?.success === false && (
        <StatusAlert variant="error" title="Sign-up failed" description={state.message} />
      )}
      <Card>
        <CardHeader>
          <CardTitle>Sign up your account</CardTitle>
          <CardDescription>Enter your information below to sign up your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  key={state?.values?.name ?? "name-input"}
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  defaultValue={state?.values?.name ?? ""}
                />
                {state?.errors?.name &&
                  state?.errors?.name.map((val) => (
                    <FieldError key={val} className="text-error">
                      {val}
                    </FieldError>
                  ))}
              </Field>
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
                <FieldLabel htmlFor="confirm">Confirm Password</FieldLabel>
                <Input id="confirm" type="password" name="confirm" />
                {state?.errors?.confirm &&
                  state?.errors?.confirm.map((val) => (
                    <FieldError key={val} className="text-error">
                      {val}
                    </FieldError>
                  ))}
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Processing..." : "Sign Up"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/signin">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
