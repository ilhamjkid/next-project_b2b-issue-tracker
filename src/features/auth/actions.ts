"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import { signinFormSchema, signupFormSchema } from "@/features/auth/schemas";
import { createUser, getSingleUser } from "@/features/auth/queries";
import { signIn, signOut } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

type FormState<TValues, TErrors> =
  | {
      success: boolean;
      message: string;
      values?: TValues;
      errors?: TErrors;
    }
  | undefined;
type SignupFormState = FormState<
  { name?: string; email?: string },
  {
    name?: string[];
    email?: string[];
    password?: string[];
    confirm?: string[];
  }
>;
type SigninFormState = FormState<
  { email?: string },
  {
    email?: string[];
    password?: string[];
  }
>;

const ERROR_MESSAGES = {
  VALIDATION_FAILED: "Please correct the invalid fields before submitting again.",
  SERVER_ERROR: "An error occurred on our server. Please try again in a few moments.",
  EMAIL_ALREADY_EXISTS: "This email already has an account. Please sign in instead.",
  AUTO_SIGNIN_FAILED:
    "Your account was created successfully, but auto sign-in failed. Please sign in manually.",
  INVALID_CREDENTIALS: "The email or password you entered is incorrect. Please try again.",
} as const;

export async function signup(
  formState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const validatedFieldsResult = signupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!validatedFieldsResult.success) {
    const errorResponse: SignupFormState = {
      success: false,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      values: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
      },
      errors: z.flattenError(validatedFieldsResult.error).fieldErrors,
    };
    return errorResponse;
  }

  const { name, email, password } = validatedFieldsResult.data;

  const passwordHashResult = await hashPassword(password);
  if (!passwordHashResult.success) {
    const errorResponse: SignupFormState = {
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      values: { name, email },
    };
    return errorResponse;
  }

  const password_hash = passwordHashResult.data;

  const userResult = await createUser({
    input: { name, email, password_hash },
    output: { id: true },
  });
  if (!userResult.success) {
    const errorResponse: SignupFormState = {
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      values: { name, email },
    };
    return errorResponse;
  }
  if (userResult.data === null) {
    const errorResponse: SignupFormState = {
      success: false,
      message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      values: { name, email },
    };
    return errorResponse;
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/client",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const errorResponse: SignupFormState = {
        success: false,
        message: ERROR_MESSAGES.AUTO_SIGNIN_FAILED,
      };
      return errorResponse;
    }

    throw error;
  }
}

export async function signin(
  formState: SigninFormState,
  formData: FormData,
): Promise<SigninFormState> {
  const validatedFieldsResult = signinFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFieldsResult.success) {
    const errorResponse: SigninFormState = {
      success: false,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      values: { email: String(formData.get("email") ?? "") },
      errors: z.flattenError(validatedFieldsResult.error).fieldErrors,
    };
    return errorResponse;
  }

  const { email, password } = validatedFieldsResult.data;

  const userResult = await getSingleUser({ where: { email }, output: { role: true } });
  if (!userResult.success) {
    const errorResponse: SigninFormState = {
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      values: { email },
    };
    return errorResponse;
  }
  if (userResult.data === null) {
    const errorResponse: SigninFormState = {
      success: false,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      values: { email },
    };
    return errorResponse;
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: userResult.data.role === "CLIENT" ? "/client" : "/agent",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const errorResponse: SigninFormState = {
        success: false,
        message:
          error.type === "CredentialsSignin"
            ? ERROR_MESSAGES.INVALID_CREDENTIALS
            : ERROR_MESSAGES.SERVER_ERROR,
        values: { email },
      };
      return errorResponse;
    }

    throw error;
  }
}

export async function signout(): Promise<void> {
  await signOut({ redirectTo: "/signin" });
}
