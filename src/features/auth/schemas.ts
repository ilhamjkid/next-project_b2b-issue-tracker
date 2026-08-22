import * as z from "zod";
import { preprocessAll } from "@/lib/zod";

export const signinFormSchema = preprocessAll(
  z.object({
    email: z.email("Email is required and must be a valid email address."),
    password: z.string("Password is required."),
  }),
  (val: unknown) => (val === null || val === "" ? undefined : val),
);
