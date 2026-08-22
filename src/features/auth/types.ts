import * as z from "zod";
import { signinFormSchema } from "@/features/auth/schemas";

type SigninFormInput = z.infer<typeof signinFormSchema>;
export type SigninFormState =
  | {
      success: boolean;
      message?: string;
      values?: Partial<Pick<SigninFormInput, "email">>;
      errors?: z.core.$ZodFlattenedError<SigninFormInput>["fieldErrors"];
    }
  | undefined;
