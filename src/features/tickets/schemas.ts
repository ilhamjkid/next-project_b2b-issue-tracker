import * as z from "zod";
import { preprocessAll } from "@/lib/zod";

/**
 * Zod schema for validating the form payload when a client creates a new ticket.
 * Sanitizes input values (converting `null` or empty strings to `undefined`)
 * and enforces structural rules for essential ticket metadata.
 */
export const createTicketByClientFormSchema = preprocessAll(
  z.object({
    title: z
      .string("Title is required.")
      .min(1, "Title cannot be empty teks.")
      .max(200, "Title cannot exceed 200 characters."),
    description: z.string("Description is required.").min(1, "Description cannot be empty teks."),
    priority: z
      .enum(["LOW", "MEDIUM", "HIGH"], "Priority can only be 'LOW', 'MEDIUM', or 'HIGH'.")
      .optional(),
  }),
  (val) => (val === null || val === "" ? undefined : val),
);

/**
 * Zod schema for validating update payloads submitted by support agents.
 * Preprocesses inputs and permits partial updates across status, priority, and assigned agent.
 */
export const updateTicketByAgentPayloadSchema = preprocessAll(
  z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    assigned_to_id: z.uuid().optional(),
  }),
  (val) => (val === null || val === "" ? undefined : val),
);
