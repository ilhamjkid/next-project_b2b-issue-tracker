import * as z from "zod";

/**
 * preprocessAll<TObjectSchema>
 *
 * Dynamically wraps every single field inside a Zod object schema with a custom pre-processing function.
 * This is highly useful for global data mutations (e.g., trimming all string fields or converting empty strings to undefined)
 * before the actual schema validation takes place.
 *
 * How it works under the hood:
 * 1. ITERATE SHAPE: It extracts the internal shape definition of the original object schema using `objectSchema.shape`.
 * 2. TRANSFORM FIELDS: It loops through each key-value pair and intercepts the validation chain by injecting `z.preprocess`.
 * 3. REASSEMBLE OBJECT: It converts the transformed array entries back into an object literal using `Object.fromEntries`
 *    and typecasts the final output back to its original schema type structure.
 */
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

/**
 * getFieldErrors<TError>
 *
 * Extracts and flattens a Zod validation error instance into a structured key-value map
 * specifically tailored for form field error rendering.
 *
 * @param error - The raw Zod error instance caught during validation.
 * @returns A flattened dictionary where keys represent the schema field names and values contain arrays of error messages.
 */
export function getFieldErrors<TError extends z.ZodError>(error: TError) {
  return z.flattenError(error).fieldErrors as z.core.$ZodFlattenedError<
    TError["type"]
  >["fieldErrors"];
}
