import { get } from "../api/client";

export const suggestRoutes = (start, end) => {
  return get("/api/routes/suggest", { start, end });
};

export const getCheapestRoute = (start, end) => {
  return get("/api/routes/cheapest", { start, end });
};
