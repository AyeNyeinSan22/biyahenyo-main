package biyahenyo.biyahenyo_backend.dto;

public record RouteSummaryResponse(
        String distance,
        String duration,
        String leaveAt,
        String fastestLabel,
        String cheapestLabel
) {
}
