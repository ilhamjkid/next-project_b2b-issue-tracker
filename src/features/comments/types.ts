import { UserJoinedEntity, UserJoinedOptions } from "@/features/users/types";
import { CleanEmpty, ExtractSelection } from "@/lib/db/types";
import { Prettify, RequireAtLeastOne } from "@/lib/types";

/**
 * Represents the base comment entity structure stored in the database.
 */
export type CommentEntity = {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  created_at: Date;
};

/**
 * Represents joined relational entities for a comment.
 */
export type CommentJoinEntity = Prettify<{
  user: UserJoinedEntity;
}>;

/**
 * Options for selecting specific fields from the comment entity in query outputs.
 */
export type CommentOutputOptions = Prettify<RequireAtLeastOne<Record<keyof CommentEntity, true>>>;

/**
 * Options for including joined entity options in comment query outputs.
 */
export type CommentJoinOptions = Prettify<{ user: UserJoinedOptions | "ALL_FIELDS" }> | null;

/**
 * Dynamically resolves the final structure of a comment record based on selected output fields and join configurations.
 */
export type CommentFinalFields<
  TCommentOutputOptions extends CommentOutputOptions | "ALL_FIELDS",
  TCommentJoinOptions extends CommentJoinOptions | "ALL_FIELDS",
> = Prettify<
  (TCommentOutputOptions extends "ALL_FIELDS"
    ? CommentEntity
    : ExtractSelection<CommentEntity, TCommentOutputOptions>) &
    (TCommentJoinOptions extends null
      ? Record<never, never>
      : TCommentJoinOptions extends "ALL_FIELDS"
        ? CommentJoinEntity
        : CleanEmpty<{
            [Key in keyof TCommentJoinOptions]: Key extends keyof CommentJoinEntity
              ? TCommentJoinOptions[Key] extends "ALL_FIELDS"
                ? CommentJoinEntity[Key]
                : ExtractSelection<CommentJoinEntity[Key], TCommentJoinOptions[Key]>
              : never;
          }>)
>;

/**
 * Input payload options for creating a new comment record.
 */
export type CreateCommentInputOptions = Prettify<
  Pick<CommentEntity, "ticket_id" | "user_id" | "content"> &
    Partial<Pick<CommentEntity, "is_internal">>
>;
