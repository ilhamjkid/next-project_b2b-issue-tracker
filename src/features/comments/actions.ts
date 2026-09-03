"use server";

import { revalidatePath } from "next/cache";
import { createComment } from "@/features/comments/queries";
import { getTicket } from "@/features/tickets/queries";
import { requireAuth } from "@/lib/access";

/**
 * Server Action to create a comment for a ticket.
 * Validates authenticated user session, checks ticket existence/ownership, handles internal flag permissions based on user role, and triggers cache revalidation.
 */
export async function handleCreateComment(payload: {
  ticketId: string;
  content: string;
  isInternal: boolean;
}): Promise<{ success: boolean; message?: string }> {
  if (!payload.ticketId.trim() || !payload.content.trim()) {
    return { success: false, message: "Invalid payload." };
  }

  const user = await requireAuth();

  const ticketResult = await getTicket({
    output: { id: true },
    join: null,
    filter: {
      id: payload.ticketId.trim(),
      ...(user.role === "CLIENT" ? { created_by_id: user.id } : {}),
    },
  });
  if (!ticketResult.success) {
    return {
      success: false,
      message: ticketResult.message ?? "An error occurred on our server.",
    };
  }

  const commentResult = await createComment({
    input: {
      ticket_id: ticketResult.data.id,
      user_id: user.id,
      content: payload.content.trim(),
      is_internal: user.role === "AGENT" ? payload.isInternal : false,
    },
    output: { id: true },
  });
  if (!commentResult.success) {
    return {
      success: false,
      message: commentResult.message ?? "An error occurred on our server.",
    };
  }

  revalidatePath(`/${user.role.toLowerCase()}/tickets/${ticketResult.data.id}`);

  return { success: true };
}
