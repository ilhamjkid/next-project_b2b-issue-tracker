import * as z from "zod";
import { preprocessAll } from "@/lib/zod";

const baseTicketByClientFormSchema = z.object({
  title: z
    .string("Title is required.")
    .min(1, "Title cannot be empty teks.")
    .max(200, "Title cannot exceed 200 characters."),
  description: z.string("Description is required.").min(1, "Description cannot be empty teks."),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"], "Priority can only be 'LOW', 'MEDIUM', or 'HIGH'.")
    .optional(),
});

export const createTicketByClientFormSchema = preprocessAll(
  baseTicketByClientFormSchema,
  emptyToUndefined,
);

export const updateTicketByClientFormSchema = preprocessAll(
  baseTicketByClientFormSchema.omit({ priority: true }),
  emptyToUndefined,
);

export const updateTicketByAgentPayloadSchema = preprocessAll(
  z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    assigned_to_id: z.uuid().optional(),
  }),
  emptyToUndefined,
);

function emptyToUndefined(val: unknown): unknown {
  return val === null || val === "" ? undefined : val;
}
