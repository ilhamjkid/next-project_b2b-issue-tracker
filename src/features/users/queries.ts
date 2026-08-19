import postgres from "postgres";
import { sql } from "@/lib/db/client";

type User = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "CLIENT" | "AGENT";
  created_at: string;
};
type CreateInputOptions = Omit<User, "id" | "role" | "created_at"> & Partial<Pick<User, "role">>;
type UpdateInputOptions = Partial<Omit<User, "id" | "created_at">>;
type OutputOptions =
  | "ALL_FIELDS"
  | ({ id: true } & Partial<Record<Exclude<keyof User, "id">, boolean>>);
type OutputFields<TOutputOptions> = TOutputOptions extends "ALL_FIELDS"
  ? User
  : {
      [Key in keyof User as Key extends keyof TOutputOptions
        ? TOutputOptions[Key] extends true
          ? Key
          : never
        : never]: User[Key];
    };
type Result<OutputData extends OutputFields<OutputOptions> | OutputFields<OutputOptions>[]> =
  Promise<
    | {
        success: true;
        data: OutputData;
      }
    | {
        success: false;
        message?: string;
      }
  >;

export async function getUsers<
  const TOutputOptions extends OutputOptions = OutputOptions,
>(options: { output: TOutputOptions }): Result<OutputFields<TOutputOptions>[]> {
  try {
    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const users = await sql<OutputFields<TOutputOptions>[]>`
      SELECT ${outputFieldsQuery} FROM users
      ORDER BY created_at DESC
    `;
    return { success: true, data: users };
  } catch (error) {
    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

export async function createUser<
  const TOutputOptions extends OutputOptions = OutputOptions,
>(options: {
  input: CreateInputOptions;
  output: TOutputOptions;
}): Result<OutputFields<TOutputOptions>> {
  try {
    const inputData = Object.fromEntries(
      Object.entries(options.input).filter(([, value]) => value !== undefined),
    );

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [user] = await sql<OutputFields<TOutputOptions>[]>`
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
  const TOutputOptions extends OutputOptions = OutputOptions,
>(options: {
  userId: string;
  input: UpdateInputOptions;
  output: TOutputOptions;
}): Result<OutputFields<TOutputOptions>> {
  try {
    const inputData = Object.fromEntries(
      Object.entries(options.input).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(inputData).length === 0) {
      return { success: false, message: "No input data received." };
    }

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [user] = await sql<OutputFields<TOutputOptions>[]>`
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

export async function deleteUserById(options: { userId: string }): Result<{ id: string }> {
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

function getOutputFieldsQuery(output: OutputOptions) {
  if (output === "ALL_FIELDS") return sql`*`;

  const outputFields: string[] = [];
  Object.entries(output).forEach(([fieldName, isInclude]) => {
    if (isInclude) outputFields.push(fieldName);
  });
  return sql(outputFields);
}

function isPostgresError(error: unknown): error is postgres.PostgresError {
  return (
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
  );
}
