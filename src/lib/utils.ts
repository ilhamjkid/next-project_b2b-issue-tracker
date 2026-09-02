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

/**
 * Formats a date string, object, or timestamp into a deterministic string representation.
 * Explicitly locks locale and timeZone parameters to prevent SSR and client hydration mismatches.
 *
 * @param date - The date value to format (ISO string, Date instance, or unix timestamp).
 * @param options - Optional custom Intl.DateTimeFormatOptions to override defaults.
 * @returns A formatted date and time string.
 */
export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
    ...options,
  };

  return new Intl.DateTimeFormat("en-US", defaultOptions).format(
    typeof date === "string" ? new Date(date) : date,
  );
}
