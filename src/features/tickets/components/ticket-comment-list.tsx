import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserEntity } from "@/features/users/types";
import { cn, formatDate } from "@/lib/utils";

export function TicketCommentList({
  userRole,
  comments,
}: {
  userRole: UserEntity["role"];
  comments: {
    id: string;
    content: string;
    user: {
      name: string;
      role: "AGENT" | "CLIENT";
    };
    created_at: Date;
  }[];
}) {
  return (
    <div className="flex flex-1 flex-col-reverse gap-4 p-4 border rounded-xl overflow-y-auto scrollbar-none">
      {comments.length > 0 ? (
        comments.reverse().map((comment) => (
          <div
            key={comment.id}
            className={cn("max-w-[90%] p-4 border rounded-lg sm:max-w-[80%]", {
              "bg-card ml-auto": comment.user.role === userRole,
              "bg-secondary": comment.user.role !== userRole,
            })}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold">{comment.user.name}</h4>
                <Badge>{comment.user.role}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p>{comment.content}</p>
          </div>
        ))
      ) : (
        <div className="flex flex-1 flex-col justify-center items-center gap-2">
          <MessageSquare className="w-16 h-16 text-warning" />
          <h4 className="text-base">No comments yet</h4>
        </div>
      )}
    </div>
  );
}
