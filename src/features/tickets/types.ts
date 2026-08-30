import * as z from "zod";
import { createTicketByClientFormSchema } from "@/features/tickets/schemas";
import { UserJoinedEntity, UserJoinedOptions } from "@/features/users/types";
import { CleanEmpty, ExtractSelection } from "@/lib/db/types";
import { RequireAtLeastOne, Prettify } from "@/lib/types";

/**
 * Represents the complete raw entity structure of a ticket stored in the database.
 */
export type TicketEntity = {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  created_by_id: string;
  assigned_to_id: string | null;
  created_at: Date;
  updated_at: Date;
};

/**
 * Defines joined user entities attached to a ticket.
 * Maps 'client' (creator) and 'agent' (assigned staff) with their respective roles.
 */
export type TicketJoinUserEntity = Prettify<{
  client: Omit<UserJoinedEntity, "role"> & { role: "CLIENT" };
  agent: (Omit<UserJoinedEntity, "role"> & { role: "AGENT" }) | null;
}>;

/**
 * Field selection options for database output queries on the ticket entity.
 * Requires at least one valid property key of `TicketEntity` set to `true`.
 */
export type TicketOutputOptions = Prettify<RequireAtLeastOne<Record<keyof TicketEntity, true>>>;

/**
 * Selection options for performing JOIN operations with user relations ('client' and 'agent').
 * Accepts specific field maps, `"ALL_FIELDS"`, or `null` to disable joins.
 */
export type TicketJoinOptions = Prettify<RequireAtLeastOne<{
  client: UserJoinedOptions | "ALL_FIELDS";
  agent: UserJoinedOptions | "ALL_FIELDS";
}> | null>;

/**
 * Evaluates dynamic selection options (`TTicketOutputOptions` and `TTicketJoinOptions`)
 * to resolve the final strongly-typed shape of ticket query results.
 */
export type TicketFinalFields<
  TTicketOutputOptions extends TicketOutputOptions | "ALL_FIELDS",
  TTicketJoinOptions extends TicketJoinOptions | "ALL_FIELDS",
> = Prettify<
  (TTicketOutputOptions extends "ALL_FIELDS"
    ? TicketEntity
    : ExtractSelection<TicketEntity, TTicketOutputOptions>) &
    (TTicketJoinOptions extends null
      ? Record<never, never>
      : TTicketJoinOptions extends "ALL_FIELDS"
        ? TicketJoinUserEntity
        : CleanEmpty<{
            [Key in keyof TTicketJoinOptions]: Key extends keyof TicketJoinUserEntity
              ? TTicketJoinOptions[Key] extends "ALL_FIELDS"
                ? TicketJoinUserEntity[Key]
                : ExtractSelection<TicketJoinUserEntity[Key], TTicketJoinOptions[Key]>
              : never;
          }>)
>;

/**
 * Options for filtering ticket queries by specific field matches.
 * Enforces providing at least one filter criterion.
 */
export type TicketFilterOptions = Prettify<
  RequireAtLeastOne<
    Record<"id" | "status" | "priority" | "created_by_id" | "assigned_to_id", string | null>
  >
>;

/**
 * Configures text search parameters across specified ticket text fields.
 */
export type TicketSearchOptions = {
  fields: ("title" | "description")[];
  keyword: string;
};

/**
 * Pagination options to slice query results using page and limit.
 */
export type TicketPaginationOptions = {
  page: number;
  limit: number;
};

/**
 * Payload parameters required for creating a new ticket in the database.
 */
export type CreateTicketInputOptions = Prettify<
  Pick<TicketEntity, "title" | "description" | "created_by_id"> &
    Partial<Pick<TicketEntity, "status" | "priority" | "assigned_to_id">>
>;

/**
 * Payload parameters permitted for updating an existing ticket in the database.
 */
export type UpdateTicketInputOptions = Prettify<
  Partial<
    Pick<
      TicketEntity,
      "title" | "description" | "status" | "priority" | "created_by_id" | "assigned_to_id"
    >
  >
>;

/**
 * State object returned by client-side form actions during ticket creation.
 * Contains execution outcome status, form values, messages, or validation errors.
 */
export type CreateTicketByClientFormState =
  | {
      success: boolean;
      message?: string;
      values?: Prettify<Partial<z.infer<typeof createTicketByClientFormSchema>>>;
      errors?: z.core.$ZodFlattenedError<
        z.infer<typeof createTicketByClientFormSchema>
      >["fieldErrors"];
    }
  | undefined;

/**
 * Payload structure for updates submitted specifically by support agents.
 * Requires `ticketId` alongside at least one updated property (`status`, `priority`, or `assigned_to_id`).
 */
export type UpdateTicketByAgentPayload = Prettify<
  RequireAtLeastOne<
    {
      ticketId: string;
      status: string;
      priority: string;
      assigned_to_id: string;
    },
    "status" | "priority" | "assigned_to_id"
  >
>;
