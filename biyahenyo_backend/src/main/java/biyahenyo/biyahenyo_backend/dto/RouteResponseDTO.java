package biyahenyo.biyahenyo_backend.dto;

import java.util.List;

public record RouteResponseDTO(
    String routeName,
    String estimatedTime,
    String trafficLevel,
    List<CoordinateResponse> path
) {}
