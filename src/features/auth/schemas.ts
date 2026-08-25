import * as z from "zod";
import { preprocessAll } from "@/lib/zod";

/**
 * Validation schema for user authentication (Sign In).
 * Automatically processes empty spaces and string inputs before validating credential compliance.
 */
export const signinFormSchema = preprocessAll(
  z.object({
    email: z.email("Email is required and must be a valid email address."),
    password: z.string("Password is required."),
  }),
  (val: unknown): unknown => (val === null || val === "" ? undefined : val),
);
