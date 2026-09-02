import {
  CreateUserInputOptions,
  UpdateUserInputOptions,
  UserEntity,
  UserOutputFields,
  UserOutputOptions,
} from "@/features/users/types";
import { Prettify, Result } from "@/lib/types";
import { getOutputFieldsQuery, isPostgresError } from "@/lib/db/utils";
import { sql } from "@/lib/db/client";

/**
 * Fetches user records ordered by creation date descending.
 * Supports explicit field selection and optional filtering (e.g., by role).
 */
export async function getUsers<
  TUserOutputOptions extends UserOutputOptions | "ALL_FIELDS" = UserOutputOptions | "ALL_FIELDS",
>(options: {
  output: TUserOutputOptions;
  filter?: { role?: string };
}): Promise<Result<UserOutputFields<TUserOutputOptions>[]>> {
  try {
    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const whereQuery = options.filter?.role ? sql`WHERE role = ${options.filter.role}` : sql``;

    const users = await sql<UserOutputFields<TUserOutputOptions>[]>`
      SELECT ${outputFieldsQuery} FROM users
      ${whereQuery} ORDER BY created_at DESC
    `;
    return { success: true, data: users };
  } catch (error) {
    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

/**
 * Retrieves a single user record matching the specified unique email address.
 * Dynamically projects selected columns based on output configuration options.
 */
export async function getUserByEmail<
  TUserOutputOptions extends UserOutputOptions | "ALL_FIELDS" = UserOutputOptions | "ALL_FIELDS",
>(options: {
  userEmail: string;
  output: TUserOutputOptions;
}): Promise<Result<UserOutputFields<TUserOutputOptions>>> {
  try {
    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [user] = await sql<UserOutputFields<TUserOutputOptions>[]>`
      SELECT ${outputFieldsQuery} FROM users WHERE email = ${options.userEmail}
    `;
    if (!user) return { success: false, message: "User data not found." };

    return { success: true, data: user };
  } catch (error) {
    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

/**
 * Inserts a new user record into the database with sanitized non-undefined fields.
 * Gracefully intercepts Postgres code 23505 to prevent duplicate email registration.
 */
export async function createUser<
  TUserOutputOptions extends UserOutputOptions | "ALL_FIELDS" = UserOutputOptions | "ALL_FIELDS",
>(options: {
  input: CreateUserInputOptions;
  output: TUserOutputOptions;
}): Promise<Result<UserOutputFields<TUserOutputOptions>>> {
  try {
    const cleanInput = Object.fromEntries(
      Object.entries(options.input).filter(([, value]) => value !== undefined),
    );

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [user] = await sql<UserOutputFields<TUserOutputOptions>[]>`
      INSERT INTO users ${sql(cleanInput)} RETURNING ${outputFieldsQuery}
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

/**
 * Updates an existing user record matching the target ID using sanitized input fields.
 * Safely prevents duplicate record collisions and handles missing data fallbacks.
 */
export async function updateUserById<
  TUserOutputOptions extends UserOutputOptions | "ALL_FIELDS" = UserOutputOptions | "ALL_FIELDS",
>(options: {
  userId: string;
  input: UpdateUserInputOptions;
  output: TUserOutputOptions;
}): Promise<Result<UserOutputFields<TUserOutputOptions>>> {
  try {
    const cleanInput = Object.fromEntries(
      Object.entries(options.input).filter(([, value]) => value !== undefined),
    );

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [user] = await sql<UserOutputFields<TUserOutputOptions>[]>`
      UPDATE users SET ${sql(cleanInput)}
      WHERE id = ${options.userId}
      RETURNING ${outputFieldsQuery}
    `;
    if (!user) return { success: false, message: "User data not found." };

    return { success: true, data: user };
  } catch (error) {
    if (isPostgresError(error)) {
      if (error.code === "22P02") {
        return { success: false, message: "User data not found." };
      }

      if (error.code === "23505") {
        return { success: false, message: "This email is already in use." };
      }
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

/**
 * Hard deletes a single user record from the database based on the target ID.
 * Returns a narrowed object payload strictly containing the deleted record identifier.
 */
export async function deleteUserById(options: {
  userId: string;
}): Promise<Result<Prettify<Pick<UserEntity, "id">>>> {
  try {
    const [user] = await sql<Pick<UserEntity, "id">[]>`
      DELETE FROM users WHERE id = ${options.userId} RETURNING id
    `;
    if (!user) return { success: false, message: "User data not found." };

    return { success: true, data: user };
  } catch (error) {
    if (isPostgresError(error) && error.code === "22P02") {
      return { success: false, message: "User data not found." };
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}
