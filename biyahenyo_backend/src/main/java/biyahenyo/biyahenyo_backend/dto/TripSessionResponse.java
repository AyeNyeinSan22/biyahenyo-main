package biyahenyo.biyahenyo_backend.dto;

import java.util.List;

public record TripSessionResponse(
        String tripId,
        String title,
        String mode,
        int currentStep,
        boolean completed,
        List<TripStepResponse> steps,
        TripStatusResponse status,
        CoordinateResponse mapCenter,
        CoordinateResponse originPosition,
        CoordinateResponse destinationPosition,
        CoordinateResponse currentPosition,
        CoordinateResponse vehiclePosition,
        String driverId,
        List<CoordinateResponse> routePath
) {
}
