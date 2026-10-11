export function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export const STATUS_LABELS = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};
