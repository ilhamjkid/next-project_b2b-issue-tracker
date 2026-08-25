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
 * Fetches all user records from the database ordered by registration date.
 * Supports explicit field filtering or defaults to full entity extraction.
 */
export async function getUsers(): Promise<Result<UserOutputFields<"ALL_FIELDS">[]>>;
export async function getUsers<
  const TUserOutputOptions extends UserOutputOptions = UserOutputOptions,
>(output: TUserOutputOptions): Promise<Result<UserOutputFields<TUserOutputOptions>[]>>;
export async function getUsers<
  const TUserOutputOptions extends UserOutputOptions = Required<UserOutputOptions>,
>(
  output?: TUserOutputOptions,
): Promise<Result<UserOutputFields<TUserOutputOptions | "ALL_FIELDS">[]>> {
  try {
    const outputFieldsQuery = getOutputFieldsQuery(output);

    const users = await sql<UserOutputFields<TUserOutputOptions | "ALL_FIELDS">[]>`
      SELECT ${outputFieldsQuery} FROM users ORDER BY created_at DESC
    `;
    return { success: true, data: users };
  } catch (error) {
    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

/**
 * Retrieves a single user record matching the specified unique email address.
 * Employs positional parameters to ensure highly responsive field autocomplete.
 */
export async function getUserByEmail(
  userEmail: string,
): Promise<Result<UserOutputFields<"ALL_FIELDS">>>;
export async function getUserByEmail<
  const TUserOutputOptions extends UserOutputOptions = UserOutputOptions,
>(
  userEmail: string,
  output: TUserOutputOptions,
): Promise<Result<UserOutputFields<TUserOutputOptions>>>;
export async function getUserByEmail<
  const TUserOutputOptions extends UserOutputOptions = UserOutputOptions,
>(
  userEmail: string,
  output?: TUserOutputOptions,
): Promise<Result<UserOutputFields<TUserOutputOptions | "ALL_FIELDS">>> {
  try {
    const outputFieldsQuery = getOutputFieldsQuery(output);

    const [user] = await sql<UserOutputFields<TUserOutputOptions | "ALL_FIELDS">[]>`
      SELECT ${outputFieldsQuery} FROM users WHERE email = ${userEmail}
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
export async function createUser(
  input: CreateUserInputOptions,
): Promise<Result<UserOutputFields<"ALL_FIELDS">>>;
export async function createUser<
  const TUserOutputOptions extends UserOutputOptions = UserOutputOptions,
>(
  input: CreateUserInputOptions,
  output: TUserOutputOptions,
): Promise<Result<UserOutputFields<TUserOutputOptions>>>;
export async function createUser<
  const TUserOutputOptions extends UserOutputOptions = UserOutputOptions,
>(
  input: CreateUserInputOptions,
  output?: TUserOutputOptions,
): Promise<Result<UserOutputFields<TUserOutputOptions | "ALL_FIELDS">>> {
  try {
    const inputData = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    );

    const outputFieldsQuery = getOutputFieldsQuery(output);

    const [user] = await sql<UserOutputFields<TUserOutputOptions | "ALL_FIELDS">[]>`
      INSERT INTO users ${sql(inputData)} RETURNING ${outputFieldsQuery}
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
export async function updateUserById(
  userId: string,
  input: UpdateUserInputOptions,
): Promise<Result<UserOutputFields<"ALL_FIELDS">>>;
export async function updateUserById<
  const TUserOutputOptions extends UserOutputOptions = UserOutputOptions,
>(
  userId: string,
  input: UpdateUserInputOptions,
  output: TUserOutputOptions,
): Promise<Result<UserOutputFields<TUserOutputOptions>>>;
export async function updateUserById<
  const TUserOutputOptions extends UserOutputOptions = UserOutputOptions,
>(
  userId: string,
  input: UpdateUserInputOptions,
  output?: TUserOutputOptions,
): Promise<Result<UserOutputFields<TUserOutputOptions | "ALL_FIELDS">>> {
  try {
    const inputData = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    );

    const outputFieldsQuery = getOutputFieldsQuery(output);

    const [user] = await sql<UserOutputFields<TUserOutputOptions | "ALL_FIELDS">[]>`
      UPDATE users SET ${sql(inputData)} WHERE id = ${userId} RETURNING ${outputFieldsQuery}
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

/**
 * Hard deletes a single user record from the database based on the target ID.
 * Returns a narrowed object payload strictly containing the deleted record identifier.
 */
export async function deleteUserById(
  userId: string,
): Promise<Result<Prettify<Pick<UserEntity, "id">>>> {
  try {
    const [user] = await sql<Pick<UserEntity, "id">[]>`
      DELETE FROM users WHERE id = ${userId} RETURNING id
    `;
    if (!user) return { success: false, message: "User data not found." };

    return { success: true, data: user };
  } catch (error) {
    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}
