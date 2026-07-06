package biyahenyo.biyahenyo_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record DriverLocationUpdateRequest(
        @Size(max = 200, message = "Label must be 200 characters or fewer")
        String label,

        @Min(value = -90, message = "Latitude must be between -90 and 90")
        @Max(value = 90, message = "Latitude must be between -90 and 90")
        Double latitude,

        @Min(value = -180, message = "Longitude must be between -180 and 180")
        @Max(value = 180, message = "Longitude must be between -180 and 180")
        Double longitude,

        @Min(value = 0, message = "ETA must be non-negative")
        @Max(value = 1440, message = "ETA must be 1440 minutes or fewer")
        Integer etaMinutes,

        @Size(max = 20, message = "Traffic must be 20 characters or fewer")
        String traffic
) {
}
