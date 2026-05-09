import { get, post } from "./client";

export function updateDriverLiveLocation({ latitude, longitude, etaMinutes, traffic }) {
  return post("/api/driver/update-location", {
    latitude,
    longitude,
    etaMinutes,
    traffic,
  });
}

export function getDriverLocation(driverId) {
  return get(`/api/driver/location/${encodeURIComponent(driverId)}`);
}
