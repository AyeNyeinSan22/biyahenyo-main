package biyahenyo.biyahenyo_backend.dto;

public record RecentTripResponse(
        String route,
        String fare,
        String distance,
        String duration
) {
}
