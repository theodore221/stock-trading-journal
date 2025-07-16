import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format the difference between two dates using
// Y (years), M (months), D (days), H (hours) and m (minutes).
// Minutes use a lowercase letter to avoid confusion with months.
export function formatDuration(startDate, endDate) {
  const ms = endDate - startDate;
  if (Number.isNaN(ms) || ms <= 0) return "";

  let remaining = Math.floor(ms / 1000); // seconds
  const years = Math.floor(remaining / (365 * 24 * 60 * 60));
  remaining -= years * 365 * 24 * 60 * 60;
  const months = Math.floor(remaining / (30 * 24 * 60 * 60));
  remaining -= months * 30 * 24 * 60 * 60;
  const days = Math.floor(remaining / (24 * 60 * 60));
  remaining -= days * 24 * 60 * 60;
  const hours = Math.floor(remaining / (60 * 60));
  remaining -= hours * 60 * 60;
  const minutes = Math.floor(remaining / 60);

  const parts = [];
  if (years) parts.push(`${years}Y`);
  if (months || years) parts.push(`${months}M`);
  if (days || months || years) parts.push(`${days}D`);
  if (hours || days || months || years) parts.push(`${hours}H`);
  parts.push(`${minutes}m`);

  return parts.join(" ");
}
