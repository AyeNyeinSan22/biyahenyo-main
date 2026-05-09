import { get } from "../api/client";

export const estimateFare = (vehicleType, distance, passengerType = "REGULAR") => {
  return get("/api/fare/estimate", { vehicleType, distance, passengerType });
};
