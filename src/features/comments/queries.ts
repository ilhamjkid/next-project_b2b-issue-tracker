import {
  CommentFinalFields,
  CommentJoinOptions,
  CommentOutputOptions,
  CreateCommentInputOptions,
} from "@/features/comments/types";
import { getOutputFieldsQuery, isPostgresError } from "@/lib/db/utils";
import { sql } from "@/lib/db/client";
import { Result } from "@/lib/types";

/**
 * Fetches a list of comments filtered by ticket or internal status with configurable field selection and user join context.
 * Safely handles invalid parameter representation (22P02) by returning an empty collection.
 */
export async function getComments<
  TCommentOutputOptions extends CommentOutputOptions | "ALL_FIELDS" =
    | CommentOutputOptions
    | "ALL_FIELDS",
  TCommentJoinOptions extends CommentJoinOptions | "ALL_FIELDS" = CommentJoinOptions | "ALL_FIELDS",
>(options: {
  output: TCommentOutputOptions;
  join: TCommentJoinOptions;
  filter?: { ticket_id?: string; is_internal?: boolean };
}): Promise<Result<CommentFinalFields<TCommentOutputOptions, TCommentJoinOptions>[]>> {
  try {
    const outputFieldsQuery =
      options.output === "ALL_FIELDS"
        ? sql`c.*`
        : sql(
            Object.entries(options.output)
              .filter(([, include]) => include)
              .map(([field]) => `c.${field}`),
          );

    const userFieldsQuery =
      options.join === null
        ? undefined
        : options.join === "ALL_FIELDS"
          ? sql`u.id, u.name, u.email, u.role`
          : options.join.user === "ALL_FIELDS"
            ? sql`u.id, u.name, u.email, u.role`
            : sql(
                Object.entries(options.join.user)
                  .filter(([, include]) => include)
                  .map(([field]) => `u.${field}`),
              );
    const userSelectQuery = userFieldsQuery
      ? sql`, (SELECT to_jsonb(user_data) FROM (SELECT ${userFieldsQuery}) user_data) AS user`
      : sql``;
    const userJoinQuery = userFieldsQuery ? sql`INNER JOIN users u ON c.user_id = u.id` : sql``;

    const { filter } = options;
    const whereQuery =
      filter !== undefined
        ? filter.ticket_id !== undefined && filter.is_internal === undefined
          ? sql`WHERE c.ticket_id = ${filter.ticket_id}`
          : filter.ticket_id === undefined && filter.is_internal !== undefined
            ? sql`WHERE c.is_internal = ${filter.is_internal}`
            : filter.ticket_id !== undefined && filter.is_internal !== undefined
              ? sql`WHERE c.ticket_id = ${filter.ticket_id}
                    AND c.is_internal = ${filter.is_internal}`
              : sql``
        : sql``;

    const comments = await sql<CommentFinalFields<TCommentOutputOptions, TCommentJoinOptions>[]>`
      SELECT ${outputFieldsQuery} ${userSelectQuery} FROM comments c ${userJoinQuery} ${whereQuery}
      ORDER BY c.created_at ASC
    `;

    return { success: true, data: comments };
  } catch (error) {
    if (isPostgresError(error) && error.code === "22P02") {
      return { success: true, data: [] };
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

/**
 * Inserts a new comment record into the database.
 * Filters out undefined fields and handles foreign key and invalid type database errors.
 */
export async function createComment<
  TCommentOutputOptions extends CommentOutputOptions | "ALL_FIELDS" =
    | CommentOutputOptions
    | "ALL_FIELDS",
>(options: {
  input: CreateCommentInputOptions;
  output: TCommentOutputOptions;
}): Promise<Result<CommentFinalFields<TCommentOutputOptions, null>>> {
  try {
    const cleanInput = Object.fromEntries(
      Object.entries(options.input).filter(([, value]) => value !== undefined),
    );

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [comment] = await sql<CommentFinalFields<TCommentOutputOptions, null>[]>`
      INSERT INTO comments ${sql(cleanInput)} RETURNING ${outputFieldsQuery}
    `;
    if (!comment) return { success: false };

    return { success: true, data: comment };
  } catch (error) {
    if (isPostgresError(error)) {
      if (error.code === "22P02") {
        return { success: false, message: "Invalid field data type." };
      }

      if (error.code === "23503") {
        return { success: false, message: "Invalid reference data provided." };
      }
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}
