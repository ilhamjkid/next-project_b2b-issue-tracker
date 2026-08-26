/**
 * ExtractSelection<TEntity, TOutputOptions>
 *
 * Dynamically filters and extracts fields from a base entity based on the provided output options object.
 *
 * How it works under the hood:
 * 1. MAPPED TYPE FILTER: Loops through each key of 'TEntity'.
 * 2. KEY REMAPPING (as): Verifies if the key exists in 'TOutputOptions' AND evaluates to 'true'.
 * 3. EXCLUSION: If 'true', the key is preserved; otherwise, it resolves to 'never' and is stripped from the type.
 */
export type ExtractSelection<TEntity, TOutputOptions> = {
  [Key in keyof TEntity as Key extends keyof TOutputOptions
    ? TOutputOptions[Key] extends true
      ? Key
      : never
    : never]: TEntity[Key];
};

/**
 * CleanEmpty<TObject>
 *
 * Scans an object and strips out top-level properties that evaluate to 'undefined' or 'never'.
 * If the resulting object has no valid properties left, it safely returns an empty object literal '{}'.
 *
 * How it works under the hood:
 * 1. GUARD CLAUSE: If 'TObject' resolves to 'never', it returns 'Record<never, never>' (empty object).
 * 2. KEY REMAPPING (as): It iterates through keys and checks if the property value extends 'undefined | never'.
 *    If true, it casts the key to 'never' to discard it, effectively cleaning up the object layout.
 */
export type CleanEmpty<TObject> = TObject extends never
  ? Record<never, never>
  : {
      [K in keyof TObject as TObject[K] extends undefined | never ? never : K]: TObject[K];
    };
