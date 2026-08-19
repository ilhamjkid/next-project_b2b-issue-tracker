import { sql } from "@/lib/db/client";

type User = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "CLIENT" | "AGENT";
  created_at: string;
};
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
type Result<OutputData extends OutputFields<OutputOptions>> = Promise<
  { success: true; data: OutputData } | { success: false; message?: string }
>;

export async function getSingleUserByEmail<
  const TOutputOptions extends OutputOptions = OutputOptions,
>(options: { userEmail: string; output: TOutputOptions }): Result<OutputFields<TOutputOptions>> {
  try {
    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [user] = await sql<OutputFields<TOutputOptions>[]>`
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

function getOutputFieldsQuery(output: OutputOptions) {
  if (output === "ALL_FIELDS") return sql`*`;

  const outputFields: string[] = [];
  Object.entries(output).forEach(([fieldName, isInclude]) => {
    if (isInclude) outputFields.push(fieldName);
  });
  return sql(outputFields);
}
