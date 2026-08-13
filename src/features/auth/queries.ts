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
type WhereOptions = { id: string; email?: undefined } | { id?: undefined; email: string };
type OutputOptions = "ALL_FIELDS" | Partial<Record<keyof User, boolean>>;
type OutputFields<TOutputOptions> = TOutputOptions extends "ALL_FIELDS"
  ? User
  : {
      [Key in keyof User as Key extends keyof TOutputOptions
        ? TOutputOptions[Key] extends true
          ? Key
          : never
        : never]: User[Key];
    };
type Result<
  Data extends OutputFields<OutputOptions>,
  Input extends CreateInputOptions | undefined = undefined,
> = Promise<
  | {
      success: true;
      data: Data | null;
    }
  | {
      success: false;
      message?: Input extends undefined //
        ? string
        : string | Partial<Record<keyof Input, string>>;
    }
>;

export async function getSingleUser<
  const TOutputOptions extends OutputOptions = OutputOptions,
>(options: { where: WhereOptions; output: TOutputOptions }): Result<OutputFields<TOutputOptions>> {
  try {
    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [user] = await sql<OutputFields<TOutputOptions>[]>`
      SELECT ${outputFieldsQuery} FROM users
      WHERE ${options.where.id ? sql`id` : sql`email`}
      = ${options.where.id ?? options.where.email}
    `;
    return { success: true, data: user ?? null };
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
}): Result<OutputFields<TOutputOptions>, CreateInputOptions> {
  try {
    const inputData = { ...options.input };
    if (inputData.role === undefined) {
      delete inputData.role;
    }

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [user] = await sql<OutputFields<TOutputOptions>[]>`
      INSERT INTO users ${sql(inputData)}
      RETURNING ${outputFieldsQuery}
    `;
    return { success: true, data: user ?? null };
  } catch (error) {
    console.error("[DATABASE] Query error.\n", error);
    return {
      success: false,
      ...(error instanceof postgres.PostgresError && error.code === "23505"
        ? { message: { email: "Email address not available." } }
        : {}),
    };
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
