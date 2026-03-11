export type AppMode = "prediction" | "dynamic";

export const APP_MODE: AppMode =
  (import.meta.env.VITE_APP_MODE as AppMode) === "dynamic"
    ? "dynamic"
    : "prediction";

export const isPredictionMode = APP_MODE === "prediction";
export const isDynamicMode = APP_MODE === "dynamic";
