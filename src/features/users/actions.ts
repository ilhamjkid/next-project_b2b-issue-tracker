"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { UserFormState } from "@/features/users/types";
import { createUserFormSchema, updateUserFormSchema } from "@/features/users/schemas";
import { createUser, updateUserById, deleteUserById } from "@/features/users/queries";
import { requireAuth } from "@/lib/access";
import { getFieldErrors } from "@/lib/zod";
import { hashPassword } from "@/lib/password";
import { signOut, unstable_update } from "@/lib/auth";

const ERROR_MESSAGES = {
  SERVER_ERROR: "An error occurred on our server.",
  VALIDATION_FAILED: "The submitted data is invalid.",
  ACCESS_DENIED: "Access denied.",
  CANNOT_CHANGE_ROLE: "You cannot change your role.",
} as const;

export async function handleCreateUser(
  formState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAuth("AGENT");

  const validatedFieldsResult = createUserFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!validatedFieldsResult.success) {
    const values = getInputValues(formData);
    return {
      success: false,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      errors: getFieldErrors(validatedFieldsResult.error),
      ...(values ? { values } : {}),
    };
  }

  const { name, email, role, password } = validatedFieldsResult.data;

  const passwordHashResult = await hashPassword(password);
  if (!passwordHashResult.success) {
    return {
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      values: { name, email, role },
    };
  }

  const password_hash = passwordHashResult.data;

  const userResult = await createUser({
    input: { name, email, password_hash, role },
    output: { id: true },
  });
  if (!userResult.success) {
    return {
      success: false,
      message: userResult.message ?? ERROR_MESSAGES.SERVER_ERROR,
      values: { name, email, role },
    };
  }

  revalidatePath("/agent/users");

  return { success: true };
}

export async function handleUpdateUser(
  bound: { userId: string },
  formState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const user = await requireAuth();

  const { userId } = bound;

  if (user.role === "CLIENT" && user.id !== userId) {
    const values = getInputValues(formData);
    return {
      success: false,
      message: ERROR_MESSAGES.ACCESS_DENIED,
      ...(values ? { values } : {}),
    };
  }

  const validatedFieldsResult = updateUserFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!validatedFieldsResult.success) {
    const values = getInputValues(formData);
    return {
      success: false,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      errors: getFieldErrors(validatedFieldsResult.error),
      ...(values ? { values } : {}),
    };
  }

  const { name, email, role, password } = validatedFieldsResult.data;

  if (user.role === "CLIENT" && role === "AGENT") {
    return {
      success: false,
      message: ERROR_MESSAGES.CANNOT_CHANGE_ROLE,
      values: { name, email, role },
    };
  }

  let password_hash: string | undefined = undefined;

  if (password) {
    const passwordHashResult = await hashPassword(password);
    if (!passwordHashResult.success) {
      return {
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
        values: { name, email, role },
      };
    }

    password_hash = passwordHashResult.data;
  }

  const userResult = await updateUserById({
    userId,
    input: { name, email, password_hash, role },
    output: { id: true, name: true, email: true, role: true },
  });
  if (!userResult.success) {
    return {
      success: false,
      message: userResult.message ?? ERROR_MESSAGES.SERVER_ERROR,
      values: { name, email, role },
    };
  }

  if (user.id === userResult.data.id) {
    if (password_hash) return await signOut({ redirectTo: "/signin" });

    await unstable_update({
      user: {
        name: userResult.data.name,
        email: userResult.data.email,
        role: userResult.data.role,
      },
    });
    return redirect(
      user.role === "CLIENT" ? "/client/settings" : "/agent/users",
      RedirectType.replace,
    );
  }

  revalidatePath("/agent/users");

  return { success: true };
}

export async function handleDeleteUser(bound: { userId: string }): Promise<UserFormState> {
  const user = await requireAuth("AGENT");

  const { userId } = bound;

  const userResult = await deleteUserById({ userId });
  if (!userResult.success) {
    return {
      success: false,
      message: userResult.message ?? ERROR_MESSAGES.SERVER_ERROR,
    };
  }

  if (user.id === userResult.data.id) {
    return await signOut({ redirectTo: "/signin" });
  }

  revalidatePath("/agent/users");

  return { success: true };
}

function getInputValues(formData: FormData):
  | {
      name?: string;
      email?: string;
      role?: "CLIENT" | "AGENT";
    }
  | undefined {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const role = String(formData.get("role") ?? "");
  const values: {
    name?: string;
    email?: string;
    role?: "CLIENT" | "AGENT";
  } = {
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
    ...(role === "CLIENT" || role === "AGENT" ? { role } : {}),
  };
  return Object.keys(values).length > 0 ? values : undefined;
}
