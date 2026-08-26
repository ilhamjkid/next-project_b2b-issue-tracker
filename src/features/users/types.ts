import type { Dispatch, SetStateAction } from "react";
import * as z from "zod";
import { baseUserFormSchema } from "@/features/users/schemas";
import { Prettify, RequireAtLeastOne } from "@/lib/types";
import { ExtractSelection } from "@/lib/db/types";

/**
 * Represents the core User model as stored exactly inside the database.
 */
export type UserEntity = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "CLIENT" | "AGENT";
  created_at: Date;
};

/**
 * A narrowed subset of the User entity containing safe fields for relational queries (JOINs).
 */
export type UserJoinedEntity = Pick<UserEntity, "id" | "name" | "email" | "role">;

/**
 * Selection options configuration when fetching a User as a nested relation (JOIN).
 */
export type UserJoinedOptions = Prettify<RequireAtLeastOne<Record<keyof UserJoinedEntity, true>>>;

/**
 * Selection options configuration for specifying which primary User columns to select.
 */
export type UserOutputOptions = Prettify<RequireAtLeastOne<Record<keyof UserEntity, true>>>;

/**
 * Dynamically resolves the final shape of primary User fields based on the selected output options.
 */
export type UserOutputFields<TUserOutputOptions extends UserOutputOptions | "ALL_FIELDS"> =
  TUserOutputOptions extends "ALL_FIELDS"
    ? Prettify<UserEntity>
    : ExtractSelection<Prettify<UserEntity>, TUserOutputOptions>;

/**
 * Represents the input options required to insert a new user record into the database.
 */
export type CreateUserInputOptions = Prettify<
  Pick<UserEntity, "name" | "email" | "password_hash"> & Partial<Pick<UserEntity, "role">>
>;

/**
 * Represents the clean payload schema required to update an existing user profile.
 */
export type UpdateUserInputOptions = Prettify<
  Pick<UserEntity, "name" | "email"> & Partial<Pick<UserEntity, "password_hash" | "role">>
>;

/**
 * The standard response shape returned by User server actions to handle form feedback loops.
 */
export type UserFormState =
  | {
      success: boolean;
      message?: string;
      values?: Prettify<
        Partial<Pick<z.infer<typeof baseUserFormSchema>, "name" | "email" | "role">>
      >;
      errors?: z.core.$ZodFlattenedError<z.infer<typeof baseUserFormSchema>>["fieldErrors"];
    }
  | undefined;

/**
 * Manages the client-side state machine for opening specific dialog triggers (Create/Update/Delete).
 */
export type UserActiveDialog =
  | { type?: undefined; id?: undefined }
  | { type: "CREATE"; id?: undefined }
  | { type: "UPDATE" | "DELETE"; id: UserEntity["id"] };

/**
 * State dispatcher type for controlling the active user dialog overlay.
 */
export type SetUserActiveDialog = Dispatch<SetStateAction<UserActiveDialog>>;
