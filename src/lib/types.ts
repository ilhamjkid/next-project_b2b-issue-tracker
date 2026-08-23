/**
 * RequireAtLeastOne<T, Keys>
 *
 * Generates a union type ensuring that AT LEAST ONE of the specified keys in 'T'
 * must be provided, preventing an empty object '{}' from being valid.
 *
 * How it works under the hood:
 * 1. LEFT SIDE (Pick/Exclude): Filters out 'Keys' from 'T' to extract any globally
 *    required properties that must exist in every union variant. If 'Keys' is empty,
 *    it defaults to all keys, resulting in a neutral empty object '{}'.
 *
 * 2. RIGHT SIDE (Mapped Type Loop): Loops through each key in 'Keys'. In each iteration,
 *    it forces the current key to be absolutely 'Required' (stripping the '?'), while
 *    making the remaining keys 'Partial' (optional).
 *
 * 3. INDEXED ACCESS ([Keys]): Destructures the giant mapped object into a clean
 *    Union Type (|) based on the target keys.
 *
 * 4. INTERSECTION (&): Merges the globally required properties from Left Side into
 *    each union variant from Right Side.
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];
