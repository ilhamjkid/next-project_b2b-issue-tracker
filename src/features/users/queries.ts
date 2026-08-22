import {
  CreateUserInputOptions,
  UpdateUserInputOptions,
  UserOutputFields,
  UserOutputOptions,
  UserQueryResult,
} from "@/features/users/types";
import { getOutputFieldsQuery, isPostgresError } from "@/lib/db/utils";
import { sql } from "@/lib/db/client";

export async function getUsers<
  const TUserOutputOptions extends UserOutputOptions = UserOutputOptions,
>(options: {
  output: TUserOutputOptions;
}): UserQueryResult<UserOutputFields<TUserOutputOptions>[]> {
  try {
    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const users = await sql<UserOutputFields<TUserOutputOptions>[]>`
      SELECT ${outputFieldsQuery} FROM users
      ORDER BY created_at DESC
    `;
    return { success: true, data: users };
  } catch (error) {
    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

export async function getUserByEmail<
  const TUserOutputOptions extends UserOutputOptions = UserOutputOptions,
>(options: {
  userEmail: string;
  output: TUserOutputOptions;
}): UserQueryResult<UserOutputFields<TUserOutputOptions>> {
  try {
    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [user] = await sql<UserOutputFields<TUserOutputOptions>[]>`
      SELECT ${outputFieldsQuery} FROM users
      WHERE email = ${options.userEmail}
    `;
    if (!user) return { success: false, message: "User data not found." };

    return { success: true, data: user };
  } catch (error) {
    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

export async function createUser<
  const TUserOutputOptions extends UserOutputOptions = UserOutputOptions,
>(options: {
  input: CreateUserInputOptions;
  output: TUserOutputOptions;
}): UserQueryResult<UserOutputFields<TUserOutputOptions>> {
  try {
    const inputData = Object.fromEntries(
      Object.entries(options.input).filter(([, value]) => value !== undefined),
    );

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [user] = await sql<UserOutputFields<TUserOutputOptions>[]>`
      INSERT INTO users ${sql(inputData)}
      RETURNING ${outputFieldsQuery}
    `;
    if (!user) return { success: false };

    return { success: true, data: user };
  } catch (error) {
    if (isPostgresError(error) && error.code === "23505") {
      return { success: false, message: "This email is already in use." };
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

export async function updateUserById<
  const TUserOutputOptions extends UserOutputOptions = UserOutputOptions,
>(options: {
  userId: string;
  input: UpdateUserInputOptions;
  output: TUserOutputOptions;
}): UserQueryResult<UserOutputFields<TUserOutputOptions>> {
  try {
    const inputData = Object.fromEntries(
      Object.entries(options.input).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(inputData).length === 0) {
      return { success: false, message: "No input data received." };
    }

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [user] = await sql<UserOutputFields<TUserOutputOptions>[]>`
      UPDATE users SET ${sql(inputData)}
      WHERE id = ${options.userId}
      RETURNING ${outputFieldsQuery}
    `;
    if (!user) return { success: false, message: "User data not found." };

    return { success: true, data: user };
  } catch (error) {
    if (isPostgresError(error) && error.code === "23505") {
      return { success: false, message: "This email is already in use." };
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

export async function deleteUserById(options: { userId: string }): UserQueryResult<{ id: string }> {
  try {
    const [user] = await sql<{ id: string }[]>`
      DELETE FROM users WHERE id = ${options.userId}
      RETURNING id
    `;
    if (!user) return { success: false, message: "User data not found." };

    return { success: true, data: user };
  } catch (error) {
    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}
