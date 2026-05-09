package biyahenyo.biyahenyo_backend.dto;

public record StopResponse(
        String name,
        double latitude,
        double longitude,
        String areaLabel
) {
}
