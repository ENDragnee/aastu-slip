import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and merges Tailwind classes using twMerge.
 * @param inputs - A list of class name inputs.
 * @returns - A merged string of class names.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function parseDateRange(range) {
  const today = new Date();
  let startDate, endDate;

  switch (range) {
    case "today":
      startDate = endDate = today.toISOString().split("T")[0];
      break;
    case "week":
      startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split("T")[0];
      endDate = new Date().toISOString().split("T")[0];
      break;
    case "month":
      startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split("T")[0];
      endDate = new Date().toISOString().split("T")[0];
      break;
    default:
      startDate = endDate = null;
  }

  return { startDate, endDate };
}
