import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ClientTicketCommentForm() {
  return (
    <form className="flex items-stretch gap-2">
      <Textarea
        placeholder="Write your comment here..."
        className="min-h-0 max-h-[40.5px] break-all resize-none scrollbar-none"
        aria-invalid={false}
      />
      <Button type="submit" size="lg" className="font-semibold">
        SEND
      </Button>
    </form>
  );
}
