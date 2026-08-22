import postgres from "postgres";
import { sql } from "@/lib/db/client";

export function getOutputFieldsQuery(
  output: "ALL_FIELDS" | ({ id: true } & Record<string, boolean>),
) {
  if (output === "ALL_FIELDS") return sql`*`;

  const outputFields: string[] = [];
  Object.entries(output).forEach(([fieldName, isInclude]) => {
    if (isInclude) outputFields.push(fieldName);
  });
  return sql(outputFields);
}

export function isPostgresError(error: unknown): error is postgres.PostgresError {
  return (
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
  );
}
