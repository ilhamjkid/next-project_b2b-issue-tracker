import * as z from "zod";
import { signinFormSchema } from "@/features/auth/schemas";
import { Prettify } from "@/lib/types";

/**
 * The standard response shape returned by Authentication server actions to handle login form feedback loops.
 */
export type SigninFormState =
  | {
      success: boolean;
      message?: string;
      values?: Prettify<Partial<Pick<z.infer<typeof signinFormSchema>, "email">>>;
      errors?: z.core.$ZodFlattenedError<z.infer<typeof signinFormSchema>>["fieldErrors"];
    }
  | undefined;
