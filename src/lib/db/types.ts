/**
 * ExtractSelection<TEntity, TOutputOptions>
 *
 * Dynamically filters and extracts fields from a base entity based on the provided output options.
 *
 * How it works under the hood:
 * 1. CONDITIONAL CHECK: If 'TOutputOptions' is literally 'true', it bypasses filtering
 *    and returns the entire 'TEntity' untouched.
 * 2. MAPPED TYPE FILTER: If it is an object, it loops through each key of 'TEntity'.
 * 3. KEY REMAPPING (as): It verifies if the current key exists in 'TOutputOptions'
 *    AND evaluates to 'true'. If yes, the key is preserved; otherwise, it resolves to 'never'
 *    and is cleanly stripped from the final object structure.
 */
export type ExtractSelection<TEntity, TOutputOptions> = TOutputOptions extends true
  ? TEntity
  : {
      [Key in keyof TEntity as Key extends keyof TOutputOptions
        ? TOutputOptions[Key] extends true
          ? Key
          : never
        : never]: TEntity[Key];
    };

/**
 * CleanEmpty<TObject>
 *
 * Recursively scans an object and strips out any properties that evaluate to 'undefined' or 'never'.
 * If the resulting object has no valid properties left, it safely returns an empty object literal '{}'.
 *
 * How it works under the hood:
 * 1. GUARD CLAUSE: If 'TObject' resolves to 'never', it returns 'Record<never, never>' (empty object).
 * 2. KEY REMAPPING (as): It iterates through the keys and checks if the value extends 'undefined | never'.
 *    If true, it casts the key to 'never' to discard it, effectively cleaning up the object layout.
 */
export type CleanEmpty<TObject> = TObject extends never
  ? Record<never, never>
  : {
      [K in keyof TObject as TObject[K] extends undefined | never ? never : K]: TObject[K];
    };
