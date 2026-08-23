import * as z from "zod";
import {
  createTicketByClientFormSchema,
  updateTicketByClientFormSchema,
} from "@/features/tickets/schemas";
import { UserEntity } from "@/features/users/types";
import { BaseOutputFields, BaseOutputOptions, BaseQueryResult } from "@/lib/db/types";
import { RequireAtLeastOne } from "@/lib/types";

export type TicketEntity = {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  created_by_id: string;
  assigned_to_id: string;
  created_at: Date;
  updated_at: Date;
};

export type TicketWithUsers = Omit<
  TicketEntity,
  "created_by_id" | "assigned_to_id" | "updated_at"
> & {
  client: Pick<UserEntity, "id" | "name" | "email">;
  agent: Pick<UserEntity, "id" | "name" | "email"> | null;
};

export type GetTicketsFilterOptions =
  | (Partial<Pick<TicketEntity, "status" | "priority" | "created_by_id" | "assigned_to_id">> & {
      search?: string | undefined;
    })
  | undefined;

export type GetTicketWhereOptions = RequireAtLeastOne<
  Pick<TicketEntity, "id" | "created_by_id" | "assigned_to_id">
>;

export type CreateTicketInputOptions = Pick<
  TicketEntity,
  "title" | "description" | "created_by_id"
> &
  Partial<Pick<TicketEntity, "status" | "priority" | "assigned_to_id">>;
export type UpdateTicketInputOptions = Partial<
  Omit<TicketEntity, "id" | "created_by_id" | "created_at" | "updated_at">
>;

export type TicketOutputOptions = BaseOutputOptions<TicketEntity>;
export type TicketOutputFields<TTicketOutputOptions extends TicketOutputOptions> = BaseOutputFields<
  TicketEntity,
  TTicketOutputOptions
>;
export type TicketQueryResult<
  TTicketOutputFields extends
    | TicketOutputFields<TicketOutputOptions>
    | TicketOutputFields<TicketOutputOptions>[],
> = BaseQueryResult<TTicketOutputFields>;

type BaseTicketFormState<TValues = undefined, TErrors = undefined> =
  | {
      success: boolean;
      message?: string;
      values?: TValues;
      errors?: TErrors;
    }
  | undefined;
export type CreateTicketByClientFormState = BaseTicketFormState<
  Partial<z.infer<typeof createTicketByClientFormSchema>>,
  z.core.$ZodFlattenedError<z.infer<typeof createTicketByClientFormSchema>>["fieldErrors"]
>;
export type UpdateTicketByClientFormState = BaseTicketFormState<
  Partial<z.infer<typeof updateTicketByClientFormSchema>>,
  z.core.$ZodFlattenedError<z.infer<typeof updateTicketByClientFormSchema>>["fieldErrors"]
>;

export type UpdateTicketByAgentPayload =
  | {
      ticketId: string;
      status: string;
      priority?: undefined;
      assigned_to_id?: undefined;
    }
  | {
      ticketId: string;
      status?: undefined;
      priority: string;
      assigned_to_id?: undefined;
    }
  | {
      ticketId: string;
      status?: undefined;
      priority?: undefined;
      assigned_to_id: string;
    };
