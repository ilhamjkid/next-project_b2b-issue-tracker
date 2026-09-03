"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { handleCreateComment } from "@/features/comments/actions";
import { TicketEntity } from "@/features/tickets/types";

export function ClientCommentForm({ ticketId }: { ticketId: TicketEntity["id"] }) {
  const [content, setContent] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const handleBtnClickSendComment = () => {
    if (!ticketId.trim() || !content.trim()) return;

    startTransition(async () => {
      const commentResult = await handleCreateComment({
        ticketId,
        content,
        isInternal: false,
      });
      if (!commentResult.success) {
        throw new Error(commentResult.message ?? "Internal Server Error");
      }

      setContent("");
    });
  };

  return (
    <div className="flex items-stretch gap-2">
      <Textarea
        placeholder="Write your comment here..."
        className="min-h-0 max-h-[40.5px] break-all resize-none scrollbar-none"
        onChange={(e) => setContent(e.target.value)}
        value={content}
        disabled={isPending}
      />
      <Button
        size="lg"
        className="font-semibold"
        onClick={handleBtnClickSendComment}
        disabled={isPending}
      >
        SEND
      </Button>
    </div>
  );
}
