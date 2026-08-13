import * as z from "zod";

export const signupFormSchema = z.object({
  name: z
    .string("Name is required and must be valid text.")
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),
  email: z.email("Email is required and must be a valid email address."),
  password: z
    .string("Password is required and must contain the required combination of characters.")
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password cannot exceed 72 characters.")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least 1 number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character."),
});

export const signinFormSchema = z.object({
  email: z.email("Email is required and must be a valid email address."),
  password: z.string("Password is required.").min(8, "Password must be at least 8 characters."),
});
