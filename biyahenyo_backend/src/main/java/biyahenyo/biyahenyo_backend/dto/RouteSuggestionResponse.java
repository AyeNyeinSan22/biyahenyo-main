package biyahenyo.biyahenyo_backend.dto;

public record RouteSuggestionResponse(
        String route,
        String via,
        String eta,
        String traffic,
        String tone,
        boolean recommended
) {
}
