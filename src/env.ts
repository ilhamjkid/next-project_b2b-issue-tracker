import * as z from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(
      ["development", "test", "production"],
      "NODE_ENV can only be 'development', 'test', or 'production'.",
    )
    .default("development"),
  DATABASE_URL: z.url("DATABASE_URL is required and must be valid url."),
  AUTH_SECRET: z
    .string("AUTH_SECRET is required and cannot be empty text.")
    .min(1, "AUTH_SECRET is required and cannot be empty text."),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error("[ENV] Variable is invalid or missing:");
  parseResult.error.issues.forEach((err) => {
    const pathname = err.path.join(".");
    console.error(`- ${pathname}: ${err.message}`);
  });

  throw new Error("[ENV] Variable is invalid. Process terminated.");
}

export const env = parseResult.data;
