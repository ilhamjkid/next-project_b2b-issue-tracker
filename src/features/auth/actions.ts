"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import { signinFormSchema, signupFormSchema } from "@/features/auth/schemas";
import { createUser } from "@/features/auth/queries";
import { signIn, signOut } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

type FormState<TErrors> =
  | {
      success: boolean;
      message: string;
      errors?: TErrors;
    }
  | undefined;
type SignupFormState = FormState<{
  name?: string[];
  email?: string[];
  password?: string[];
}>;
type SigninFormState = FormState<{
  email?: string[];
  password?: string[];
}>;

export async function signup(
  formState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState | void> {
  const validatedFieldsResult = signupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFieldsResult.success) {
    const errorResponse: SignupFormState = {
      success: false,
      message: "Sign-up failed.",
      errors: z.flattenError(validatedFieldsResult.error).fieldErrors,
    };
    return errorResponse;
  }

  const { name, email, password } = validatedFieldsResult.data;

  const passwordHashResult = await hashPassword(password);
  if (!passwordHashResult.success) {
    return {
      success: false,
      message: "Sign-up failed.",
    };
  }

  const password_hash = passwordHashResult.data;

  try {
    const userResult = await createUser({
      input: { name, email, password_hash },
      output: { id: true },
    });
    if (!userResult.success) {
      const errEmailNotAvailable =
        userResult.message && typeof userResult.message !== "string"
          ? userResult.message.email
            ? { email: [userResult.message.email] }
            : undefined
          : undefined;
      const errorResponse: SignupFormState = {
        success: false,
        message: "Sign-up failed.",
        ...(errEmailNotAvailable ? { errors: errEmailNotAvailable } : {}),
      };
      return errorResponse;
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/client",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const errorResponse: SignupFormState = {
        success: false,
        message: "Sign-up failed.",
      };
      return errorResponse;
    }

    throw error;
  }
}

export async function signin(
  formState: SigninFormState,
  formData: FormData,
): Promise<SigninFormState | void> {
  const validatedFieldsResult = signinFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFieldsResult.success) {
    const errorResponse: SigninFormState = {
      success: false,
      message: "Sign-in failed.",
      errors: z.flattenError(validatedFieldsResult.error).fieldErrors,
    };
    return errorResponse;
  }

  try {
    await signIn("credentials", {
      email: validatedFieldsResult.data.email,
      password: validatedFieldsResult.data.password,
      redirectTo: "/client",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const errCredentialsSignin =
        error.type === "CredentialsSignin"
          ? {
              email: ["Email or Password is incorrect."],
              password: ["Email or Password is incorrect."],
            }
          : undefined;
      const errorResponse: SigninFormState = {
        success: false,
        message: "Sign-in failed.",
        ...(errCredentialsSignin ? { errors: errCredentialsSignin } : {}),
      };
      return errorResponse;
    }

    throw error;
  }
}

export async function signout(): Promise<void> {
  await signOut({ redirectTo: "/signin" });
}
