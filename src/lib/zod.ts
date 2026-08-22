import * as z from "zod";

export function preprocessAll<TObjectSchema extends z.ZodObject>(
  objectSchema: TObjectSchema,
  preprocessFn: (val: unknown) => unknown,
) {
  return z.object({
    ...Object.fromEntries(
      Object.entries(objectSchema.shape).map(([key, value]) => {
        return [key, z.preprocess(preprocessFn, value)];
      }),
    ),
  }) as TObjectSchema;
}

export function getFieldErrors<TError extends z.core.$ZodError>(error: TError) {
  return z.flattenError(error).fieldErrors as z.core.$ZodFlattenedError<
    TError["type"]
  >["fieldErrors"];
}
