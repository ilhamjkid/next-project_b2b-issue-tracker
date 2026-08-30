"use server";

import { revalidatePath } from "next/cache";
import {
  TicketEntity,
  CreateTicketByClientFormState,
  UpdateTicketByAgentPayload,
} from "@/features/tickets/types";
import {
  createTicketByClientFormSchema,
  updateTicketByAgentPayloadSchema,
} from "@/features/tickets/schemas";
import { createTicket, deleteTicketById, updateTicketById } from "@/features/tickets/queries";
import { requireAuth } from "@/lib/access";
import { getFieldErrors } from "@/lib/zod";

const ERROR_MESSAGES = {
  SERVER_ERROR: "An error occurred on our server.",
  VALIDATION_FAILED: "The submitted data is invalid.",
} as const;

/**
 * Server action to process ticket creation requests submitted by clients.
 * Enforces `CLIENT` authorization, validates form inputs, creates the database record,
 * and revalidates the client dashboard route cache.
 */
export async function handleCreateTicketByClient(
  formState: CreateTicketByClientFormState,
  formData: FormData,
): Promise<CreateTicketByClientFormState> {
  const { id: created_by_id } = await requireAuth("CLIENT");

  const validatedFieldsResult = createTicketByClientFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
  });
  if (!validatedFieldsResult.success) {
    return {
      success: false,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      values: getInputValues(formData),
      errors: getFieldErrors(validatedFieldsResult.error),
    };
  }

  const { title, description, priority } = validatedFieldsResult.data;

  const ticketCreatedResult = await createTicket({
    input: { title, description, priority, created_by_id },
    output: { id: true },
  });
  if (!ticketCreatedResult.success) {
    return {
      success: false,
      message: ticketCreatedResult.message ?? ERROR_MESSAGES.SERVER_ERROR,
      values: getInputValues(formData),
    };
  }

  revalidatePath("/client");

  return { success: true };
}

/**
 * Server action to process ticket update requests submitted by agents.
 * Enforces `AGENT` authorization, validates payload parameters, updates ticket fields,
 * and revalidates the specific agent ticket detail page cache.
 */
export async function handleUpdateTicketByAgent(
  payload: UpdateTicketByAgentPayload,
): Promise<{ success: boolean; message?: string }> {
  await requireAuth("AGENT");

  const validatedPayloadResult = updateTicketByAgentPayloadSchema.safeParse({
    status: payload.status,
    priority: payload.priority,
    assigned_to_id: payload.assigned_to_id,
  });
  if (!validatedPayloadResult.success) {
    return { success: false, message: "Invalid payload." };
  }

  const { status, priority, assigned_to_id } = validatedPayloadResult.data;

  const ticketUpdatedResult = await ticketUpdatedResultHelper(payload, {
    status,
    priority,
    assigned_to_id,
  });
  if (!ticketUpdatedResult.success) {
    return {
      success: false,
      message: ticketUpdatedResult.message ?? ERROR_MESSAGES.SERVER_ERROR,
    };
  }

  revalidatePath(`/agent/tickets/${ticketUpdatedResult.data.id}`);

  return { success: true };
}

/**
 * Helper execution wrapper for `updateTicketById` within agent server actions.
 */
async function ticketUpdatedResultHelper(
  payload: UpdateTicketByAgentPayload,
  input: {
    status?: TicketEntity["status"];
    priority?: TicketEntity["priority"];
    assigned_to_id?: string;
  },
) {
  return await updateTicketById({
    ticketId: payload.ticketId,
    input,
    output: { id: true },
  });
}

/**
 * Server action to process ticket deletion requests submitted by agents.
 * Enforces `AGENT` authorization, deletes the ticket by ID, and revalidates the agent dashboard cache.
 */
export async function handleDeleteTicketByAgent(payload: {
  ticketId: string;
}): Promise<{ success: boolean; message?: string }> {
  await requireAuth("AGENT");

  const ticketDeletedResult = await deleteTicketById({
    ticketId: payload.ticketId,
  });
  if (!ticketDeletedResult.success) {
    return {
      success: false,
      message: ticketDeletedResult.message ?? ERROR_MESSAGES.SERVER_ERROR,
    };
  }

  revalidatePath("/agent");

  return { success: true };
}

/**
 * Helper function to extract and format form input values from `FormData` for preserving user inputs on validation failure.
 */
function getInputValues(formData: FormData): NonNullable<CreateTicketByClientFormState>["values"] {
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const priority = String(formData.get("priority") ?? "");
  const values: NonNullable<CreateTicketByClientFormState>["values"] = {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(((priority: string): priority is TicketEntity["priority"] =>
      ["LOW", "MEDIUM", "HIGH"].includes(priority))(priority)
      ? { priority }
      : {}),
  };
  return Object.keys(values).length > 0 ? values : undefined;
}
