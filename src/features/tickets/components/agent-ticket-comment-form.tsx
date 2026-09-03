"use client";

import * as React from "react";
import { Eye, Lock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";

export function AgentTicketCommentForm() {
  const [isInternal, setIsInternal] = React.useState(false);

  return (
    <form className="flex items-stretch gap-2 flex-wrap sm:flex-nowrap">
      <Textarea
        placeholder="Write your comment here..."
        className="min-h-0 max-h-[40.5px] break-all resize-none scrollbar-none"
        aria-invalid={false}
      />
      <Toggle
        size="lg"
        variant="outline"
        pressed={isInternal}
        onPressedChange={setIsInternal}
        className="px-4"
      >
        {isInternal ? (
          <>
            <Lock />
            <span>Internal</span>
          </>
        ) : (
          <>
            <Eye />
            <span>Public</span>
          </>
        )}
      </Toggle>
      <Button type="submit" size="lg" className="font-semibold">
        SEND
      </Button>
    </form>
  );
}
