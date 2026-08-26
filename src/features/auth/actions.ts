"use server";

import { AuthError } from "next-auth";
import { SigninFormState } from "@/features/auth/types";
import { signinFormSchema } from "@/features/auth/schemas";
import { getUserByEmail } from "@/features/users/queries";
import { getFieldErrors } from "@/lib/zod";
import { signIn, signOut } from "@/lib/auth";

const ERROR_MESSAGES = {
  SERVER_ERROR: "An error occurred on our server.",
  VALIDATION_FAILED: "The submitted data is invalid.",
  INVALID_CREDENTIALS: "The email or password you entered is incorrect.",
} as const;

/**
 * Server action to process user authentication.
 * Validates login payload, checks user role definitions, and establishes a secure NextAuth session.
 */
export async function handleSignin(
  formState: SigninFormState,
  formData: FormData,
): Promise<SigninFormState> {
  const validatedFieldsResult = signinFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFieldsResult.success) {
    return {
      success: false,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      values: getInputValues(formData),
      errors: getFieldErrors(validatedFieldsResult.error),
    };
  }

  const { email, password } = validatedFieldsResult.data;

  const userResult = await getUserByEmail({
    userEmail: email,
    output: { role: true },
  });
  if (!userResult.success) {
    return {
      success: false,
      message:
        userResult.message === "User data not found."
          ? ERROR_MESSAGES.INVALID_CREDENTIALS
          : ERROR_MESSAGES.SERVER_ERROR,
      values: getInputValues(formData),
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: userResult.data.role === "CLIENT" ? "/client" : "/agent",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message:
          error.type === "CredentialsSignin"
            ? ERROR_MESSAGES.INVALID_CREDENTIALS
            : ERROR_MESSAGES.SERVER_ERROR,
        values: getInputValues(formData),
      };
    }

    throw error;
  }
}

/**
 * Server action to terminate the active user authentication session and redirect to the sign-in page.
 */
export async function handleSignout(): Promise<void> {
  await signOut({ redirectTo: "/signin" });
}

/**
 * Assistant function to filter out and capture the email text field from the submitted login FormData.
 */
function getInputValues(formData: FormData): NonNullable<SigninFormState>["values"] {
  const email = String(formData.get("email") ?? "");
  const values: NonNullable<SigninFormState>["values"] = {
    ...(email ? { email } : {}),
  };
  return Object.keys(values).length > 0 ? values : undefined;
}
