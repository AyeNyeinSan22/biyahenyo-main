import { get } from "../api/client";

export const getJeepneyRoutes = () => {
  return get("/api/transport/jeepney");
};

export const getTricycleRoutes = () => {
  return get("/api/transport/tricycle");
};
