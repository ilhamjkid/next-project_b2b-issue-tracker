import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn (Class Names)
 *
 * A utility function that combines `clsx` and `tailwind-merge` to handle conditional CSS classes.
 * It resolves Tailwind CSS class conflicts elegantly by ensuring the last defined class overrides previous ones.
 *
 * @param inputs - An array of class names, objects, or arrays that need to be conditionally merged.
 * @returns A clean, space-separated string of optimized Tailwind CSS classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
