import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to conditionally join class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}