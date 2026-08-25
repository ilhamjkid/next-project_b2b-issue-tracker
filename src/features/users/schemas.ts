import * as z from "zod";
import { preprocessAll } from "@/lib/zod";

/**
 * Baseline validation schema containing all required user credential and profile fields.
 */
export const baseUserFormSchema = z.object({
  name: z
    .string("Name is required and must be valid text.")
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),
  email: z.email("Email is required and must be a valid email address."),
  role: z.enum(["CLIENT", "AGENT"], "Role can only be CLIENT or AGENT.").optional(),
  password: z
    .string("Password is required.")
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password cannot exceed 72 characters.")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least 1 number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character."),
  confirm: z.string("Confirm password is required."),
});

/**
 * Validation schema for registering new users.
 * Automatically sanitizes empty values and strictly enforces password confirmation parity.
 */
export const createUserFormSchema = preprocessAll(baseUserFormSchema, (val: unknown): unknown =>
  val === null || val === "" ? undefined : val,
).refine((data) => data.password === data.confirm, {
  error: "Confirm password does not match.",
  path: ["confirm"],
});

/**
 * Validation schema for modifying existing user data.
 * Makes security credentials optional while maintaining strict password parity validation if provided.
 */
export const updateUserFormSchema = preprocessAll(
  baseUserFormSchema.partial({ password: true, confirm: true }),
  (val: unknown): unknown => (val === null || val === "" ? undefined : val),
).refine((data) => data.password === data.confirm, {
  error: "Confirm password does not match.",
  path: ["confirm"],
});
