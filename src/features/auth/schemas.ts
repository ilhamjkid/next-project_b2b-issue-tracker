import * as z from "zod";

export const signinFormSchema = z.object({
  email: z.email("Email is required and must be a valid email address."),
  password: z.string("Password is required."),
});
