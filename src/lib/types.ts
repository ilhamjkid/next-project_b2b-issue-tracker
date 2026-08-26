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
 * Recursively flattens intersection types (`A & B`) and complex mapped types into a clean object structure.
 * Forces VS Code IntelliSense to expand and display all evaluated properties on hover for better DX.
 *
 * How it works under the hood:
 * Uses a recursive conditional type. It checks if TObject is a function (preserving it untouched),
 * otherwise maps over every key and recursively calls Prettify on nested property values.
 */
export type Prettify<TObject> = TObject extends object
  ? TObject extends (...args: unknown[]) => unknown
    ? TObject
    : { [Key in keyof TObject]: Prettify<TObject[Key]> }
  : TObject;

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
