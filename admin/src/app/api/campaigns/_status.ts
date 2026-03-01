// src/app/api/campaigns/_status.ts
export const uiToDb = (s?: string) =>
  (String(s ?? "").toLowerCase() === "completed")
    ? "COMPLETED"
    : (String(s ?? "").toLowerCase() === "active")
      ? "ACTIVE"
      : "PLANNING";

export const dbToUi = (s?: string) =>
  (String(s ?? "").toUpperCase() === "COMPLETED")
    ? "Completed"
    : (String(s ?? "").toUpperCase() === "ACTIVE")
      ? "Active"
      : "Upcoming";
