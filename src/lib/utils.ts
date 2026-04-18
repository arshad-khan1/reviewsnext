import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns either white or slate-900 depending on the brightness of the input hex color
 */
export function getContrastColor(hexcolor: string) {
  // If not a valid hex, return white as fallback
  if (!hexcolor || !hexcolor.startsWith("#") || hexcolor.length !== 7)
    return "#ffffff";

  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#0f172a" : "#ffffff";
}
