import {
  CreateTicketInputOptions,
  GetTicketsFilterOptions,
  GetTicketWhereOptions,
  TicketOutputFields,
  TicketOutputOptions,
  TicketQueryResult,
  TicketWithUsers,
  UpdateTicketInputOptions,
} from "@/features/tickets/types";
import { getOutputFieldsQuery, isPostgresError } from "@/lib/db/utils";
import { sql } from "@/lib/db/client";

export async function getTickets(options: {
  filters: GetTicketsFilterOptions;
}): TicketQueryResult<TicketWithUsers[]> {
  try {
    const { filters } = options;

    const conditions = [];
    if (filters?.status) conditions.push(sql`status = ${filters.status}`);
    if (filters?.priority) conditions.push(sql`priority = ${filters.priority}`);
    if (filters?.created_by_id) conditions.push(sql`created_by_id = ${filters.created_by_id}`);
    if (filters?.assigned_to_id) conditions.push(sql`assigned_to_id = ${filters.assigned_to_id}`);
    if (filters?.search && filters.search.trim() !== "") {
      const searchPattern = `%${filters.search.trim()}%`;
      conditions.push(sql`title ILIKE ${searchPattern}`);
    }

    const whereQuery =
      conditions.length > 0
        ? sql`WHERE ${conditions.reduce((acc, cond) => {
            return sql`${acc} AND ${cond}`;
          })}`
        : sql``;

    const tickets = await sql<TicketWithUsers[]>`
      SELECT t.id, t.title, t.description,
      t.status, t.priority, t.created_at,
      json_build_object(
        'id', c.id,
        'name', c.name,
        'email', c.email
      ) AS client,
      CASE 
        WHEN a.id IS NOT NULL THEN json_build_object(
          'id', a.id,
          'name', a.name,
          'email', a.email
        )
        ELSE NULL
      END AS agent
      FROM tickets t
      INNER JOIN users c ON t.created_by_id = c.id
      LEFT JOIN users a ON t.assigned_to_id = a.id
      ${whereQuery} ORDER BY created_at DESC
    `;

    return { success: true, data: tickets };
  } catch (error) {
    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

export async function getTicket<
  const TTicketOutputOptions extends TicketOutputOptions = TicketOutputOptions,
>(options: {
  where: GetTicketWhereOptions;
  output: TTicketOutputOptions;
}): TicketQueryResult<TicketOutputFields<TTicketOutputOptions>> {
  try {
    const cleanWhere = Object.fromEntries(
      Object.entries(options.where).filter(([, value]) => value !== undefined),
    );

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [ticket] = await sql<TicketOutputFields<TTicketOutputOptions>[]>`
      SELECT ${outputFieldsQuery} FROM tickets WHERE ${sql(cleanWhere, "AND")}
    `;
    if (!ticket) return { success: false, message: "Ticket data not found." };

    return { success: true, data: ticket };
  } catch (error) {
    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

export async function createTicket<
  const TTicketOutputOptions extends TicketOutputOptions = TicketOutputOptions,
>(options: {
  input: CreateTicketInputOptions;
  output: TTicketOutputOptions;
}): TicketQueryResult<TicketOutputFields<TTicketOutputOptions>> {
  try {
    const inputData = Object.fromEntries(
      Object.entries(options.input).filter(([, value]) => value !== undefined),
    );

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [ticket] = await sql<TicketOutputFields<TTicketOutputOptions>[]>`
      INSERT INTO tickets ${sql(inputData)}
      RETURNING ${outputFieldsQuery}
    `;
    if (!ticket) return { success: false };

    return { success: true, data: ticket };
  } catch (error) {
    if (isPostgresError(error) && error.code === "23503") {
      return { success: false, message: "Invalid reference data provided." };
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

export async function updateTicketById<
  const TTicketOutputOptions extends TicketOutputOptions = TicketOutputOptions,
>(options: {
  ticketId: string;
  input: UpdateTicketInputOptions;
  output: TTicketOutputOptions;
}): TicketQueryResult<TicketOutputFields<TTicketOutputOptions>> {
  try {
    const inputData = Object.fromEntries([
      ...Object.entries(options.input).filter(([, value]) => value !== undefined),
      ["updated_at", new Date()],
    ]);

    const outputFieldsQuery = getOutputFieldsQuery(options.output);

    const [ticket] = await sql<TicketOutputFields<TTicketOutputOptions>[]>`
      UPDATE tickets SET ${sql(inputData)}
      WHERE id = ${options.ticketId}
      RETURNING ${outputFieldsQuery}
    `;
    if (!ticket) return { success: false, message: "Ticket data not found." };

    return { success: true, data: ticket };
  } catch (error) {
    if (isPostgresError(error) && error.code === "23503") {
      return { success: false, message: "Invalid reference data provided." };
    }

    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}

export async function deleteTicketById(options: {
  ticketId: string;
}): TicketQueryResult<{ id: string }> {
  try {
    const [ticket] = await sql<{ id: string }[]>`
      DELETE FROM tickets WHERE id = ${options.ticketId}
      RETURNING id
    `;
    if (!ticket) return { success: false, message: "Ticket data not found." };

    return { success: true, data: ticket };
  } catch (error) {
    console.error("[DATABASE] Query error.\n", error);
    return { success: false };
  }
}
