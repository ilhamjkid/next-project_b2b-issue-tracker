/**
 * RequireAtLeastOne<TObject, Keys>
 *
 * Generates a union type ensuring that AT LEAST ONE of the specified keys in 'TObject'
 * must be provided, preventing an empty object '{}' from being valid.
 *
 * How it works under the hood:
 * 1. LEFT SIDE (Pick/Exclude): Filters out 'Keys' from 'TObject' to extract any globally
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
export type RequireAtLeastOne<TObject, Keys extends keyof TObject = keyof TObject> = Pick<
  TObject,
  Exclude<keyof TObject, Keys>
> &
  {
    [Key in Keys]-?: Required<Pick<TObject, Key>> & Partial<Pick<TObject, Exclude<Keys, Key>>>;
  }[Keys];

/**
 * Prettify<TObject>
 *
 * Flattens nested intersection types (`A & B`) into a single, cohesive object.
 * This is a visual utility tool designed to vastly improve the developer experience (DX)
 * by forcing VS Code to display the fully evaluated object structure on hover.
 *
 * How it works under the hood:
 * The mapped type `{ [Key in keyof TObject]: TObject[Key] }` loops through all properties and re-maps them,
 * while intersecting it with an empty object `& {}` tricks TypeScript into resolving the entire
 * definition immediately instead of leaving it as an un-evaluated intersection expression.
 */
export type Prettify<TObject> = { [Key in keyof TObject]: TObject[Key] } & {};

/**
 * Result<TData>
 *
 * A standardized envelope pattern used across the application to handle operation outcomes.
 * It enforces a strict discriminating union between successful operations that return data
 * and operational failures that return an error message.
 *
 * @example
 * // For async database or API operations:
 * const getTickets = (): Promise<Result<Ticket[]>> => { ... }
 *
 * // For sync validation or helper operations:
 * const validateInput = (data: unknown): Result<ValidData> => { ... }
 */
export type Result<TData> =
  | {
      success: true;
      data: TData;
    }
  | {
      success: false;
      message?: string;
    };
