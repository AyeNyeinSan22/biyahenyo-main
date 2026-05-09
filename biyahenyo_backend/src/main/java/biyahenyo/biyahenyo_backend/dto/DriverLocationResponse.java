package biyahenyo.biyahenyo_backend.dto;

public record DriverLocationResponse(
        String label,
        String lastUpdated,
        boolean live,
        Double latitude,
        Double longitude,
        Integer etaMinutes,
        String traffic
) {
}
