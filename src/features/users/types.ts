import * as z from "zod";
import { baseUserFormSchema } from "@/features/users/schemas";
import { BaseOutputOptions, BaseOutputFields, BaseQueryResult } from "@/lib/db/types";

export type UserEntity = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "CLIENT" | "AGENT";
  created_at: Date;
};

export type CreateUserInputOptions = Pick<UserEntity, "name" | "email" | "password_hash"> &
  Partial<Pick<UserEntity, "role">>;
export type UpdateUserInputOptions = Pick<UserEntity, "name" | "email"> &
  Partial<Pick<UserEntity, "password_hash" | "role">>;

export type UserOutputOptions = BaseOutputOptions<UserEntity>;
export type UserOutputFields<TUserOutputOptions extends UserOutputOptions> = BaseOutputFields<
  UserEntity,
  TUserOutputOptions
>;
export type UserQueryResult<
  TUserOutputFields extends
    | UserOutputFields<UserOutputOptions>
    | UserOutputFields<UserOutputOptions>[],
> = BaseQueryResult<TUserOutputFields>;

type BaseUserFormInput = z.infer<typeof baseUserFormSchema>;
export type UserFormState =
  | {
      success: boolean;
      message?: string;
      values?: Partial<Pick<BaseUserFormInput, "name" | "email" | "role">>;
      errors?: z.core.$ZodFlattenedError<BaseUserFormInput>["fieldErrors"];
    }
  | undefined;

export type UserActiveDialog =
  | { type?: undefined; id?: undefined }
  | { type: "CREATE"; id?: undefined }
  | { type: "UPDATE" | "DELETE"; id: string };
export type SetUserActiveDialog = (newActiveDialog: UserActiveDialog) => void;
