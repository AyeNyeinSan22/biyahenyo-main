package biyahenyo.biyahenyo_backend.dto;

public record TripStepResponse(
        String bannerTitle,
        String calloutTitle,
        String calloutSubtitle,
        String eta,
        String distance,
        String arrivalTime,
        String instruction,
        String routeLabel,
        boolean showTrackButton,
        boolean arrived
) {
}
