package biyahenyo.biyahenyo_backend.dto;

public record DriverLocationUpdateRequest(
        String label,
        Double latitude,
        Double longitude,
        Integer etaMinutes,
        String traffic
) {
}
