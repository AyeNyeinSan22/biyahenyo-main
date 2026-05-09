import { get, post } from "./client";

export function getHomeDashboard(email) {
  return get("/api/home/dashboard", { email });
}

export function getDriverDashboard(email) {
  return get("/api/driver/dashboard", { email });
}

export function updateDriverLocation(email, payload) {
  return post("/api/driver/location", payload, { email });
}

export function getRoutePlan({ mode, from, to }) {
  return get("/api/routes/plan", { mode, from, to });
}

export function startTrip(payload) {
  return post("/api/routes/trips/start", payload);
}

export function getTrip(tripId) {
  return get(`/api/routes/trips/${tripId}`);
}

export function advanceTrip(tripId) {
  return post(`/api/routes/trips/${tripId}/advance`, {});
}
