import {
  CreateTicketInputOptions,
  TicketFilterOptions,
  TicketSearchOptions,
  TicketFinalFields,
  TicketJoinOptions,
  TicketOutputOptions,
  UpdateTicketInputOptions,
} from "@/features/tickets/types";
import { UserJoinedEntity } from "@/features/users/types";
import {
  getMatchFilterQuery,
  getOutputFieldsQuery,
  getSearchQuery,
  isPostgresError,
} from "@/lib/db/utils";
import { sql } from "@/lib/db/client";
import { Result } from "@/lib/types";

/**
 * Retrieves a list of ticket records matching optional filter and search criteria.
 * Supports dynamic output field selection and relation JOINs (`client` and `agent`).
 */
export async function getTickets<
  TTicketOutputOptions extends TicketOutputOptions | "ALL_FIELDS" =
    | TicketOutputOptions
    | "ALL_FIELDS",
  TTicketJoinOptions extends TicketJoinOptions | "ALL_FIELDS" = TicketJoinOptions | "ALL_FIELDS",
>(options: {
  output: TTicketOutputOptions;
  join: TTicketJoinOptions;
  filter?: TicketFilterOptions;
  search?: TicketSearchOptions;
}): Promise<Result<TicketFinalFields<TTicketOutputOptions, TTicketJoinOptions>[]>> {
  try {
    const outputFieldsQuery =
      options.output === "ALL_FIELDS"
        ? sql`t.*`
        : sql(
            Object.entries(options.output)
              .filter(([, include]) => include)
              .map(([field]) => `t.${field}`),
          );

    const clientQuery = getTicketJoinQuery(options.join, "client");
    const agentQuery = getTicketJoinQuery(options.join, "agent");

    const whereQuery = getTicketWhereQuery(options.filter, options.search);

    const tickets = await sql<TicketFinalFields<TTicketOutputOptions, TTicketJoinOptions>[]>`
      SELECT ${outputFieldsQuery} ${clientQuery.select} ${agentQuery.select}
      FROM tickets t ${clientQuery.join} ${agentQuery.join}
      ${whereQuery} ORDER BY t.created_at DESC
    `;

    return { success: true, data: tickets };
  } catch (error) {
    if (isPostgresError(error) && error.code === "22P02") {
      return { success: true, data: [] };
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

/**
 * Retrieves a single ticket record based on mandatory filter criteria.
 * Supports dynamic output field selection and relation JOINs (`client` and `agent`).
 */
export async function getTicket<
  TTicketOutputOptions extends TicketOutputOptions | "ALL_FIELDS" =
    | TicketOutputOptions
    | "ALL_FIELDS",
  TTicketJoinOptions extends TicketJoinOptions | "ALL_FIELDS" = TicketJoinOptions | "ALL_FIELDS",
>(options: {
  output: TTicketOutputOptions;
  join: TTicketJoinOptions;
  filter: TicketFilterOptions;
}): Promise<Result<TicketFinalFields<TTicketOutputOptions, TTicketJoinOptions>>> {
  try {
    const outputFieldsQuery =
      options.output === "ALL_FIELDS"
        ? sql`t.*`
        : sql(
            Object.entries(options.output)
              .filter(([, include]) => include)
              .map(([field]) => `t.${field}`),
          );

    const clientQuery = getTicketJoinQuery(options.join, "client");
    const agentQuery = getTicketJoinQuery(options.join, "agent");

    const whereQuery = getTicketWhereQuery(options.filter, undefined);

    const [ticket] = await sql<TicketFinalFields<TTicketOutputOptions, TTicketJoinOptions>[]>`
      SELECT ${outputFieldsQuery} ${clientQuery.select} ${agentQuery.select}
      FROM tickets t ${clientQuery.join} ${agentQuery.join} ${whereQuery}
    `;
    if (!ticket) return { success: false, message: "Ticket data not found." };

    return { success: true, data: ticket };
  } catch (error) {
    if (isPostgresError(error) && error.code === "22P02") {
      return { success: false, message: "Ticket data not found." };
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

/**
 * Inserts a new ticket record into the database.
 * Filters out undefined inputs and handles foreign key constraint violations.
 */
export async function createTicket<
  TTicketOutputOptions extends TicketOutputOptions | "ALL_FIELDS" =
    | TicketOutputOptions
    | "ALL_FIELDS",
>(options: {
  input: CreateTicketInputOptions;
  output: TTicketOutputOptions;
}): Promise<Result<TicketFinalFields<TTicketOutputOptions, null>>> {
  try {
    const cleanInput = Object.fromEntries(
      Object.entries(options.input).filter(([, value]) => value !== undefined),
    );

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [ticket] = await sql<TicketFinalFields<TTicketOutputOptions, null>[]>`
      INSERT INTO tickets ${sql(cleanInput)} RETURNING ${outputFieldsQuery}
    `;
    if (!ticket) return { success: false };

    return { success: true, data: ticket };
  } catch (error) {
    if (isPostgresError(error)) {
      if (error.code === "22P02") {
        return { success: false, message: "Ticket data not found." };
      }

      if (error.code === "23503") {
        return { success: false, message: "Invalid reference data provided." };
      }
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

/**
 * Updates an existing ticket record identified by its ID.
 * Automatically manages `updated_at` timestamping and checks for empty input payloads.
 */
export async function updateTicketById<
  TTicketOutputOptions extends TicketOutputOptions | "ALL_FIELDS" =
    | TicketOutputOptions
    | "ALL_FIELDS",
>(options: {
  ticketId: string;
  input: UpdateTicketInputOptions;
  output: TTicketOutputOptions;
}): Promise<Result<TicketFinalFields<TTicketOutputOptions, null>>> {
  try {
    const cleanInput = Object.fromEntries(
      Object.entries(options.input).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(cleanInput).length === 0) {
      return {
        success: false,
        message: "At least one input field must be provided.",
      };
    }

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [ticket] = await sql<TicketFinalFields<TTicketOutputOptions, null>[]>`
      UPDATE tickets SET ${sql({ ...cleanInput, ["updated_at"]: new Date() })}
      WHERE id = ${options.ticketId} RETURNING ${outputFieldsQuery}
    `;
    if (!ticket) return { success: false, message: "Ticket data not found." };

    return { success: true, data: ticket };
  } catch (error) {
    if (isPostgresError(error)) {
      if (error.code === "22P02") {
        return { success: false, message: "Ticket data not found." };
      }

      if (error.code === "23503") {
        return { success: false, message: "Invalid reference data provided." };
      }
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

/**
 * Deletes a ticket record from the database by its ID.
 */
export async function deleteTicketById(options: {
  ticketId: string;
}): Promise<Result<{ id: string }>> {
  try {
    const [ticket] = await sql<{ id: string }[]>`
      DELETE FROM tickets WHERE id = ${options.ticketId}
      RETURNING id
    `;
    if (!ticket) return { success: false, message: "Ticket data not found." };

    return { success: true, data: ticket };
  } catch (error) {
    if (isPostgresError(error) && error.code === "22P02") {
      return { success: false, message: "Ticket data not found." };
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

/**
 * Helper function to dynamically construct SQL `SELECT` (as JSONB subquery) and `JOIN` statements
 * based on requested relation selection options (`client` or `agent`).
 */
function getTicketJoinQuery(
  joinOptions: TicketJoinOptions | "ALL_FIELDS",
  relation: "client" | "agent",
) {
  if (!joinOptions) return { select: sql``, join: sql`` };

  const isAllJoin = joinOptions === "ALL_FIELDS";
  const relationOption = isAllJoin ? "ALL_FIELDS" : joinOptions[relation];

  if (!relationOption) return { select: sql``, join: sql`` };

  const alias = relation === "client" ? "c" : "a";
  const defaultFields: (keyof UserJoinedEntity)[] = ["id", "name", "email", "role"];

  const fields =
    relationOption === "ALL_FIELDS"
      ? defaultFields.map((field) => `${alias}.${field}`)
      : Object.entries(relationOption)
          .filter(([, include]) => include)
          .map(([field]) => `${alias}.${field}`);

  if (fields.length === 0) return { select: sql``, join: sql`` };

  const fieldsQuery = sql(fields);

  if (relation === "client") {
    return {
      select: sql`, (
        SELECT to_jsonb(client_data)
        FROM (SELECT ${fieldsQuery}) client_data
        ) AS client
      `,
      join: sql`INNER JOIN users c ON t.created_by_id = c.id`,
    };
  }

  return {
    select: sql`, (
      SELECT to_jsonb(agent_data)
      FROM (SELECT ${fieldsQuery}) agent_data
      WHERE a.id IS NOT NULL
      ) AS agent
    `,
    join: sql`LEFT JOIN users a ON t.assigned_to_id = a.id`,
  };
}

/**
 * Helper function to compose the SQL `WHERE` clause from combinations of match filter and search options.
 */
function getTicketWhereQuery(
  filterOptions: TicketFilterOptions | undefined,
  searchOptions: TicketSearchOptions | undefined,
) {
  const matchFilterQuery = filterOptions
    ? getMatchFilterQuery({ filter: filterOptions, logic: "AND" })
    : undefined;

  const searchQuery = searchOptions
    ? getSearchQuery({
        fields: searchOptions.fields,
        keyword: searchOptions.keyword,
        logic: "OR",
      })
    : undefined;

  if (matchFilterQuery && searchQuery) {
    return sql`WHERE ${matchFilterQuery} AND (${searchQuery})`;
  }
  if (matchFilterQuery && !searchQuery) {
    return sql`WHERE ${matchFilterQuery}`;
  }
  if (!matchFilterQuery && searchQuery) {
    return sql`WHERE ${searchQuery}`;
  }
  return sql``;
}
