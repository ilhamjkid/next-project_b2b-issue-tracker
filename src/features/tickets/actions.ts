"use server";

import { revalidatePath } from "next/cache";
import {
  CreateTicketByClientFormState,
  UpdateTicketByAgentPayload,
  UpdateTicketByClientFormState,
} from "@/features/tickets/types";
import {
  createTicketByClientFormSchema,
  updateTicketByAgentPayloadSchema,
  updateTicketByClientFormSchema,
} from "@/features/tickets/schemas";
import {
  createTicket,
  deleteTicketById,
  getTicket,
  updateTicketById,
} from "@/features/tickets/queries";
import { requireAuth } from "@/lib/access";
import { getFieldErrors } from "@/lib/zod";

const ERROR_MESSAGES = {
  SERVER_ERROR: "An error occurred on our server.",
  VALIDATION_FAILED: "The submitted data is invalid.",
  ACCESS_DENIED: "Access denied.",
} as const;

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
      values: getInputValuesFromHandleTicketByClient(formData, "CREATE"),
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
      values: getInputValuesFromHandleTicketByClient(formData, "CREATE"),
    };
  }

  revalidatePath("/client");

  return { success: true };
}

export async function handleUpdateTicketByClient(
  bound: { ticketId: string },
  formState: UpdateTicketByClientFormState,
  formData: FormData,
): Promise<UpdateTicketByClientFormState> {
  const user = await requireAuth("CLIENT");

  const ticketFoundedResult = await getTicket({
    where: { id: bound.ticketId, created_by_id: user.id },
    output: { id: true },
  });
  if (!ticketFoundedResult.success) {
    const isNotFound = ticketFoundedResult.message === "Ticket data not found.";
    return {
      success: false,
      message: isNotFound ? ERROR_MESSAGES.ACCESS_DENIED : ERROR_MESSAGES.SERVER_ERROR,
      values: getInputValuesFromHandleTicketByClient(formData, "UPDATE"),
    };
  }

  const validatedFieldsResult = updateTicketByClientFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!validatedFieldsResult.success) {
    return {
      success: false,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      values: getInputValuesFromHandleTicketByClient(formData, "UPDATE"),
      errors: getFieldErrors(validatedFieldsResult.error),
    };
  }

  const { title, description } = validatedFieldsResult.data;

  const ticketUpdatedResult = await updateTicketById({
    ticketId: ticketFoundedResult.data.id,
    input: { title, description },
    output: { id: true },
  });
  if (!ticketUpdatedResult.success) {
    return {
      success: false,
      message: ticketUpdatedResult.message ?? ERROR_MESSAGES.SERVER_ERROR,
      values: getInputValuesFromHandleTicketByClient(formData, "UPDATE"),
    };
  }

  revalidatePath("/client");

  return { success: true };
}

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

  const ticketUpdatedResult = await updateTicketById({
    ticketId: payload.ticketId,
    input: { status, priority, assigned_to_id },
    output: { id: true },
  });
  if (!ticketUpdatedResult.success) {
    return {
      success: false,
      message: ticketUpdatedResult.message ?? ERROR_MESSAGES.SERVER_ERROR,
    };
  }

  revalidatePath(`/agent/tickets/${payload.ticketId}`);

  return { success: true };
}

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

function getInputValuesFromHandleTicketByClient<
  const TMode extends "CREATE" | "UPDATE" = "CREATE" | "UPDATE",
>(
  formData: FormData,
  mode: TMode,
):
  | (TMode extends "CREATE"
      ? NonNullable<CreateTicketByClientFormState>["values"]
      : NonNullable<UpdateTicketByClientFormState>["values"])
  | undefined {
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const priority = String(formData.get("priority") ?? "");
  const priorities = ["LOW", "MEDIUM", "HIGH"];
  const values = Object.assign(
    { ...(title ? { title } : {}), ...(description ? { description } : {}) },
    mode === "CREATE" ? (priorities.includes(priority) ? { priority } : {}) : {},
  );
  return Object.keys(values).length > 0 ? values : undefined;
}
