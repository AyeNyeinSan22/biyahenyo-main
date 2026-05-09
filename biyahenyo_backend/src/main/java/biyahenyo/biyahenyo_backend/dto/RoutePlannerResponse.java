package biyahenyo.biyahenyo_backend.dto;

import java.util.List;

public class RoutePlannerResponse {
    private String from;
    private String to;
    private String selectedMode;
    private List<String> availableModes;
    private RouteSummaryResponse summary;
    private List<SegmentResponse> segments;
    private CoordinateResponse mapCenter;
    private CoordinateResponse originCoordinate;
    private CoordinateResponse destinationCoordinate;
    private List<CoordinateResponse> routePath;
    private String trafficLevel;
    private String driverId;

    public RoutePlannerResponse() {}

    public RoutePlannerResponse(String from, String to, String selectedMode, List<String> availableModes, 
                                RouteSummaryResponse summary, List<SegmentResponse> segments, 
                                CoordinateResponse mapCenter, CoordinateResponse originCoordinate, 
                                CoordinateResponse destinationCoordinate, List<CoordinateResponse> routePath) {
        this.from = from;
        this.to = to;
        this.selectedMode = selectedMode;
        this.availableModes = availableModes;
        this.summary = summary;
        this.segments = segments;
        this.mapCenter = mapCenter;
        this.originCoordinate = originCoordinate;
        this.destinationCoordinate = destinationCoordinate;
        this.routePath = routePath;
    }

    // Getters and Setters
    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }
    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }
    public String getSelectedMode() { return selectedMode; }
    public void setSelectedMode(String selectedMode) { this.selectedMode = selectedMode; }
    public List<String> getAvailableModes() { return availableModes; }
    public void setAvailableModes(List<String> availableModes) { this.availableModes = availableModes; }
    public RouteSummaryResponse getSummary() { return summary; }
    public void setSummary(RouteSummaryResponse summary) { this.summary = summary; }
    public List<SegmentResponse> getSegments() { return segments; }
    public void setSegments(List<SegmentResponse> segments) { this.segments = segments; }
    public CoordinateResponse getMapCenter() { return mapCenter; }
    public void setMapCenter(CoordinateResponse mapCenter) { this.mapCenter = mapCenter; }
    public CoordinateResponse getOriginCoordinate() { return originCoordinate; }
    public void setOriginCoordinate(CoordinateResponse originCoordinate) { this.originCoordinate = originCoordinate; }
    public CoordinateResponse getDestinationCoordinate() { return destinationCoordinate; }
    public void setDestinationCoordinate(CoordinateResponse destinationCoordinate) { this.destinationCoordinate = destinationCoordinate; }
    public List<CoordinateResponse> getRoutePath() { return routePath; }
    public void setRoutePath(List<CoordinateResponse> routePath) { this.routePath = routePath; }
    public String getTrafficLevel() { return trafficLevel; }
    public void setTrafficLevel(String trafficLevel) { this.trafficLevel = trafficLevel; }
    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }
}
