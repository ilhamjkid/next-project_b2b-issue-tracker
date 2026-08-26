import postgres from "postgres";
import { sql } from "@/lib/db/client";
import { RequireAtLeastOne } from "@/lib/types";

type MatchFilterValue = string | number | boolean | null;
type MatchFilterOptions = {
  filter: Partial<Record<string, MatchFilterValue>>;
  logic: "AND" | "OR";
};
type SearchOptions = {
  fields: string[];
  keyword: string;
  logic: "AND" | "OR";
};
type OutputOptions = RequireAtLeastOne<Record<string, true>> | undefined;

/**
 * Generates a dynamic SQL fragment for precise field matching (e.g., `id = 1 AND status IS NULL`).
 * Automatically strips out fields with `undefined` values and formats `null` values using `IS NULL`.
 *
 * @returns A composite `postgres.Sql` fragment chained with the specified logic,
 *          or `undefined` if the clean filter object is empty.
 */
export function getMatchFilterQuery(matchFilterOptions: MatchFilterOptions) {
  const cleanFilter = Object.entries(matchFilterOptions.filter).filter(
    ([, value]) => value !== undefined,
  ) as [string, MatchFilterValue][];

  const isFilterEmpty = cleanFilter.length === 0;
  if (isFilterEmpty) return undefined;

  return cleanFilter
    .map(([field, value]) => {
      if (value === null) {
        return sql`${sql(field)} IS NULL`;
      } else return sql`${sql(field)} = ${value}`;
    })
    .reduce((acc, current) => {
      if (matchFilterOptions.logic === "AND") {
        return sql`${acc} AND ${current}`;
      } else return sql`${acc} OR ${current}`;
    });
}

/**
 * Generates a dynamic SQL fragment for text searching across multiple fields using `ILIKE` (case-insensitive).
 * Automatically handles duplicate fields and sanitizes trailing spaces from the keyword.
 *
 * @returns A composite `postgres.Sql` fragment chained with the specified logic,
 *          or `undefined` if fields array or keyword is empty.
 */
export function getSearchQuery(searchOptions: SearchOptions) {
  const uniqueFields = [...new Set(searchOptions.fields)];

  const isFieldsEmpty = uniqueFields.length === 0;
  const isKeywordEmpty = searchOptions.keyword.trim() === "";
  if (isFieldsEmpty || isKeywordEmpty) return undefined;

  const keyword = `%${searchOptions.keyword.trim()}%`;

  return uniqueFields
    .map((field) => sql`${sql(field)} ILIKE ${keyword}`)
    .reduce((acc, current) => {
      if (searchOptions.logic === "AND") {
        return sql`${acc} AND ${current}`;
      } else return sql`${acc} OR ${current}`;
    });
}

/**
 * Transforms an output selection configuration object into a safe SQL column selection fragment.
 * Maps keys evaluated to `true` into sanitised SQL identifiers.
 *
 * @returns A comma-separated `postgres.Sql` identifier list of selected columns,
 *          or defaults to `*` if output configuration is `undefined` or contains no enabled fields.
 */
export function getOutputFieldsQuery(output: OutputOptions) {
  if (output === undefined) return sql`*`;

  const outputFields = Object.entries(output)
    .filter(([, isInclude]) => isInclude)
    .map(([field]) => field);

  if (outputFields.length === 0) return sql`*`;

  return sql(outputFields);
}

/**
 * Type guard to safely check whether an unknown error instance originated from the `postgres` driver.
 * Verifies object signature shape matching a standard Postgres error response.
 */
export function isPostgresError(error: unknown): error is postgres.PostgresError {
  return (
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
  );
}
