package biyahenyo.biyahenyo_backend.dto;

import java.util.List;

public record DriverDashboardResponse(
        String title,
        String dateLabel,
        String driverName,
        DriverLocationResponse currentLocation,
        EtaCardResponse eta,
        List<RouteSuggestionResponse> routeSuggestions,
        List<StopResponse> routeStops,
        String routeColor,
        String routeLabel
) {
}
