import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and merges Tailwind classes using twMerge.
 * @param inputs - A list of class name inputs.
 * @returns - A merged string of class names.
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}
