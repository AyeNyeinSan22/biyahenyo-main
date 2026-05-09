package biyahenyo.biyahenyo_backend.dto;

import java.util.List;

public record HomeDashboardResponse(
        String appName,
        String headline,
        String subheadline,
        String fromLabel,
        String toPlaceholder,
        List<TrafficBarResponse> trafficBars,
        RecentTripResponse recentTrip
) {
}
