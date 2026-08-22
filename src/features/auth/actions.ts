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

export async function handleSignin(
  formState: SigninFormState,
  formData: FormData,
): Promise<SigninFormState> {
  const validatedFieldsResult = signinFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFieldsResult.success) {
    const email = String(formData.get("email") ?? "");
    return {
      success: false,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      errors: getFieldErrors(validatedFieldsResult.error),
      ...(email ? { values: { email } } : {}),
    };
  }

  const { email, password } = validatedFieldsResult.data;

  const userResult = await getUserByEmail({
    userEmail: email,
    output: { id: true, role: true },
  });
  if (!userResult.success) {
    const message = userResult.message
      ? ERROR_MESSAGES.INVALID_CREDENTIALS
      : ERROR_MESSAGES.SERVER_ERROR;
    return { success: false, message, values: { email } };
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
        values: { email },
      };
    }

    throw error;
  }
}

export async function handleSignout(): Promise<void> {
  await signOut({ redirectTo: "/signin" });
}
