package biyahenyo.biyahenyo_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StartTripRequest(
        @NotBlank(message = "Transport mode is required")
        @Size(max = 20, message = "Mode must be 20 characters or fewer")
        String mode,

        @NotBlank(message = "Origin is required")
        @Size(max = 200, message = "Origin must be 200 characters or fewer")
        String from,

        @NotBlank(message = "Destination is required")
        @Size(max = 200, message = "Destination must be 200 characters or fewer")
        String to
) {
}
