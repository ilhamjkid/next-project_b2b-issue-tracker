"use client";

import * as React from "react";
import { EyeIcon, LockIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { handleCreateComment } from "@/features/comments/actions";
import { TicketEntity } from "@/features/tickets/types";

export function AgentCommentForm({ ticketId }: { ticketId: TicketEntity["id"] }) {
  const [content, setContent] = React.useState("");
  const [isInternal, setIsInternal] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const handleBtnClickSendComment = () => {
    if (!ticketId.trim() || !content.trim()) return;

    startTransition(async () => {
      const commentResult = await handleCreateComment({
        ticketId,
        content,
        isInternal,
      });
      if (!commentResult.success) {
        throw new Error(commentResult.message ?? "Internal Server Error");
      }

      setContent("");
      setIsInternal(false);
    });
  };

  return (
    <div className="flex items-stretch gap-2 flex-wrap sm:flex-nowrap">
      <Textarea
        placeholder="Write your comment here..."
        className="min-h-0 max-h-[40.5px] break-all resize-none scrollbar-none"
        onChange={(e) => setContent(e.target.value)}
        value={content}
        disabled={isPending}
      />
      <Toggle
        size="lg"
        variant="outline"
        className="px-4"
        pressed={isInternal}
        onPressedChange={setIsInternal}
        disabled={isPending}
      >
        {isInternal ? (
          <>
            <LockIcon />
            <span>Internal</span>
          </>
        ) : (
          <>
            <EyeIcon />
            <span>Public</span>
          </>
        )}
      </Toggle>
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
