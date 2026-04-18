/**
 * Centralized date formatting utility for backend-driven UI consistency.
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  
  // Using fixed en-US locale for consistent backend-driven UI
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
