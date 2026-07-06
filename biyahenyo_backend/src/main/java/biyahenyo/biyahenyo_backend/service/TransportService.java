package biyahenyo.biyahenyo_backend.service;

import static biyahenyo.biyahenyo_backend.util.GeoUtil.distanceMeters;
import static biyahenyo.biyahenyo_backend.util.GeoUtil.samePoint;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import biyahenyo.biyahenyo_backend.dto.CoordinateResponse;
import biyahenyo.biyahenyo_backend.dto.DriverDashboardResponse;
import biyahenyo.biyahenyo_backend.dto.DriverLocationResponse;
import biyahenyo.biyahenyo_backend.dto.DriverLocationUpdateRequest;
import biyahenyo.biyahenyo_backend.dto.EtaCardResponse;
import biyahenyo.biyahenyo_backend.dto.HomeDashboardResponse;
import biyahenyo.biyahenyo_backend.dto.RecentTripResponse;
import biyahenyo.biyahenyo_backend.dto.RoutePlannerResponse;
import biyahenyo.biyahenyo_backend.dto.RouteSuggestionResponse;
import biyahenyo.biyahenyo_backend.dto.RouteSummaryResponse;
import biyahenyo.biyahenyo_backend.dto.SegmentResponse;
import biyahenyo.biyahenyo_backend.dto.StartTripRequest;
import biyahenyo.biyahenyo_backend.dto.StopResponse;
import biyahenyo.biyahenyo_backend.dto.TrafficBarResponse;
import biyahenyo.biyahenyo_backend.dto.TripSessionResponse;
import biyahenyo.biyahenyo_backend.dto.TripStatusResponse;
import biyahenyo.biyahenyo_backend.dto.TripStepResponse;
import biyahenyo.biyahenyo_backend.model.TransitRoute;
import biyahenyo.biyahenyo_backend.model.TransitRouteStop;
import biyahenyo.biyahenyo_backend.model.TransitStop;
import biyahenyo.biyahenyo_backend.model.TransitVehicle;
import biyahenyo.biyahenyo_backend.model.TransportMode;
import biyahenyo.biyahenyo_backend.model.TransportRoute;
import biyahenyo.biyahenyo_backend.model.VehicleLocation;
import biyahenyo.biyahenyo_backend.model.VehicleStatus;
import biyahenyo.biyahenyo_backend.repository.TransitRouteRepository;
import biyahenyo.biyahenyo_backend.repository.TransitRouteStopRepository;
import biyahenyo.biyahenyo_backend.repository.TransitVehicleRepository;
import biyahenyo.biyahenyo_backend.repository.TransportRepository;
import biyahenyo.biyahenyo_backend.repository.VehicleLocationRepository;
import biyahenyo.biyahenyo_backend.service.GeocodingService.GeocodedPlace;
import biyahenyo.biyahenyo_backend.service.RoutingService.RouteResult;

@Service
@Transactional
public class TransportService {

    private static final Logger log = LoggerFactory.getLogger(TransportService.class);
    private static final DateTimeFormatter DRIVER_DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);
    private static final List<String> AVAILABLE_MODES = List.of("TRICYCLE", "JEEPNEY");

    private final TransitRouteRepository routeRepository;
    private final TransitRouteStopRepository routeStopRepository;
    private final TransitVehicleRepository vehicleRepository;
    private final VehicleLocationRepository locationRepository;
    private final TransportRepository transportRepository;
    private final GeocodingService geocodingService;
    private final RoutingService routingService;
    private final Map<String, TripState> trips = new ConcurrentHashMap<>();

    public TransportService(
            TransitRouteRepository routeRepository,
            TransitRouteStopRepository routeStopRepository,
            TransitVehicleRepository vehicleRepository,
            VehicleLocationRepository locationRepository,
            TransportRepository transportRepository,
            GeocodingService geocodingService,
            RoutingService routingService
    ) {
        this.routeRepository = routeRepository;
        this.routeStopRepository = routeStopRepository;
        this.vehicleRepository = vehicleRepository;
        this.locationRepository = locationRepository;
        this.transportRepository = transportRepository;
        this.geocodingService = geocodingService;
        this.routingService = routingService;
    }

    public List<TransportRoute> getJeepneyRoutes() {
        return transportRepository.findByVehicleType("JEEPNEY");
    }

    public List<TransportRoute> getTricycleRoutes() {
        return transportRepository.findByVehicleType("TRICYCLE");
    }

    public HomeDashboardResponse getHomeDashboard(String email) {
        return new HomeDashboardResponse(
                "Biyahenyo",
                "Plan. Ride. Arrive.",
                "Track public transport in real time.",
                "Your location",
                "Where are you going?",
                List.of(
                        new TrafficBarResponse("Mon", 82, "#f3c449"),
                        new TrafficBarResponse("Tue", 68, "#f2c34d"),
                        new TrafficBarResponse("Wed", 55, "#f4c74f"),
                        new TrafficBarResponse("Thu", 40, "#f4c74f"),
                        new TrafficBarResponse("Fri", 25, "#f4cb67")
                ),
                new RecentTripResponse(
                        "Camella -> BSU Alangilan",
                        "11 PESO",
                        "1.0 km",
                        "5 mins"
                )
        );
    }

    public DriverDashboardResponse getDriverDashboard(String email) {
        TransitVehicle vehicle = resolveDriverVehicle(email);
        VehicleLocation location = locationRepository.findByVehicle(vehicle)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle location not found"));
        GeocodedPlace currentPlace = new GeocodedPlace(vehicle.getLabel(), location.getLatitude(), location.getLongitude());

        List<TransitRouteStop> routeStops = routeStopRepository.findByRouteOrderBySequenceNumberAsc(vehicle.getRoute());
        TransitStop destinationStop = routeStops.get(routeStops.size() - 1).getStop();
        GeocodedPlace destinationPlace = new GeocodedPlace(destinationStop.getName(), destinationStop.getLatitude(), destinationStop.getLongitude());

        List<RouteSuggestionResponse> suggestions = new ArrayList<>();
        String etaDuration = "8 mins";
        try {
            List<RouteResult> routeResults = routingService.routeBetween(
                    List.of(currentPlace.coordinate(), destinationPlace.coordinate()), 2);
            RouteResult primary = routeResults.get(0);
            etaDuration = formatMinutes(primary.durationSeconds());

            for (int index = 0; index < Math.min(2, routeResults.size()); index++) {
                RouteResult result = routeResults.get(index);
                String tone = index == 0 ? "recommended" : "alt-blue";
                suggestions.add(new RouteSuggestionResponse(
                        vehicle.getRoute().getOriginLabel() + " -> " + vehicle.getRoute().getDestinationLabel(),
                        describeVia(result),
                        formatMinutes(result.durationSeconds()),
                        inferTraffic(result.durationSeconds(), primary.durationSeconds()),
                        tone,
                        index == 0
                ));
            }
        } catch (ResponseStatusException exception) {
            log.warn("OSRM routing failed for driver dashboard ({}): {}", email, exception.getReason());
            suggestions.add(new RouteSuggestionResponse(
                    vehicle.getRoute().getOriginLabel() + " -> " + vehicle.getRoute().getDestinationLabel(),
                    destinationStop.getName(),
                    etaDuration,
                    "Moderate",
                    "recommended",
                    true
            ));
        }

        List<StopResponse> dashboardStops = routeStops.stream()
                .map(rs -> new StopResponse(
                        rs.getStop().getName(),
                        rs.getStop().getLatitude(),
                        rs.getStop().getLongitude(),
                        rs.getStop().getAreaLabel()))
                .toList();

        return new DriverDashboardResponse(
                "Driver Dashboard",
                LocalDate.now().format(DRIVER_DATE_FORMAT),
                vehicle.getDriverName(),
                new DriverLocationResponse(
                        geocodingService.locationLabelFromCoordinates(
                                location.getLatitude(), location.getLongitude(),
                                vehicle.getRoute().getDisplayName()),
                        "Just now",
                        true,
                        location.getLatitude(),
                        location.getLongitude(),
                        null,
                        "MODERATE"
                ),
                new EtaCardResponse(etaDuration, destinationStop.getName(), 34),
                suggestions,
                dashboardStops,
                extractColor(vehicle.getRoute().getDisplayName(), vehicle.getRoute().getCode()),
                vehicle.getRoute().getOriginLabel() + " ➜ " + vehicle.getRoute().getDestinationLabel()
        );
    }

    private String extractColor(String displayName, String code) {
        if (displayName != null) {
            if (displayName.contains("Yellow")) return "Yellow";
            if (displayName.contains("Blue")) return "Blue";
            if (displayName.contains("Green")) return "Green";
            if (displayName.contains("Red")) return "Red";
            if (displayName.contains("Orange")) return "Orange";
            if (displayName.contains("White")) return "White";
        }
        if (code != null) {
            if (code.contains("ALANGILAN")) return "Yellow";
            if (code.contains("BALAGTAS")) return "Yellow";
            if (code.contains("LIBJO")) return "Green";
            if (code.contains("BAUAN")) return "Blue";
            if (code.contains("CAPITOLIO")) return "White";
            if (code.contains("MABACONG")) return "Red";
        }
        return "Gray";
    }

    public DriverDashboardResponse updateDriverLocation(String email, DriverLocationUpdateRequest request) {
        TransitVehicle vehicle = resolveDriverVehicle(email);
        VehicleLocation location = locationRepository.findByVehicle(vehicle)
                .orElseGet(() -> {
                    VehicleLocation created = new VehicleLocation();
                    created.setVehicle(vehicle);
                    return created;
                });

        Double latitude = request != null ? request.latitude() : null;
        Double longitude = request != null ? request.longitude() : null;
        location.setLatitude(latitude != null ? latitude : location.getLatitude());
        location.setLongitude(longitude != null ? longitude : location.getLongitude());
        location.setUpdatedAt(LocalDateTime.now());
        locationRepository.save(location);

        return getDriverDashboard(email);
    }

    public RoutePlannerResponse getRoutePlan(String mode, String from, String to) {
        TransportMode transportMode = normalizeMode(mode);
        GeocodedPlace origin = geocodingService.resolvePlace(from);
        GeocodedPlace destination = geocodingService.resolvePlace(to);
        RouteMatch match = findBestRoute(transportMode, origin, destination);

        double waitMinutes = estimateWaitingMinutes(match);
        double walkToBoardMinutes = estimateWalkingMinutes(origin.coordinate(), match.boardingStop().coordinate());
        double walkToDestinationMinutes = estimateWalkingMinutes(match.alightingStop().coordinate(), destination.coordinate());
        double rideMinutes = estimateRideMinutes(match.transitDistanceMeters(), transportMode);
        double totalMinutes = waitMinutes + walkToBoardMinutes + walkToDestinationMinutes + rideMinutes;

        List<CoordinateResponse> checkpoints = new ArrayList<>();
        checkpoints.add(origin.coordinate());
        checkpoints.add(match.boardingStop().coordinate());
        checkpoints.addAll(match.intermediateStops().stream().map(GeocodedPlace::coordinate).toList());
        checkpoints.add(match.alightingStop().coordinate());
        checkpoints.add(destination.coordinate());

        List<RouteResult> routeResults = routingService.routeBetween(checkpoints, 1);
        RouteResult route = routeResults.get(0);

        RoutePlannerResponse response = new RoutePlannerResponse(
                origin.label(),
                destination.label(),
                transportMode.name(),
                AVAILABLE_MODES,
                new RouteSummaryResponse(
                        formatDistance(match.totalDistanceMeters()),
                        Math.max(1, Math.round(totalMinutes)) + " mins",
                        "Leave " + LocalDateTime.now().plusMinutes(2).format(TIME_FORMAT),
                        "Fastest",
                        "Cheapest"
                ),
                buildPlannerSegments(match, origin, destination, waitMinutes),
                match.boardingStop().coordinate(),
                origin.coordinate(),
                destination.coordinate(),
                route.geometry()
        );
        response.setDriverId(match.vehicle() != null ? match.vehicle().getDriverEmail() : null);
        return response;
    }

    public TripSessionResponse startTrip(StartTripRequest request) {
        TransportMode transportMode = normalizeMode(request.mode());
        GeocodedPlace origin = geocodingService.resolvePlace(request.from());
        GeocodedPlace destination = geocodingService.resolvePlace(request.to());
        RouteMatch match = findBestRoute(transportMode, origin, destination);

        List<CoordinateResponse> checkpoints = new ArrayList<>();
        checkpoints.add(origin.coordinate());
        checkpoints.add(match.boardingStop().coordinate());
        checkpoints.addAll(match.intermediateStops().stream().map(GeocodedPlace::coordinate).toList());
        checkpoints.add(match.alightingStop().coordinate());
        checkpoints.add(destination.coordinate());

        List<RouteResult> routeResults = routingService.routeBetween(checkpoints, 1);
        RouteResult route = routeResults.get(0);
        List<TripFrame> frames = buildTripFrames(match, origin, destination, route);

        TripState state = new TripState(
                UUID.randomUUID().toString(),
                origin,
                destination,
                transportMode.name(),
                0,
                frames,
                route.geometry(),
                match.vehicle() != null ? match.vehicle().getId() : null
        );

        trips.put(state.tripId(), state);
        log.info("Trip started: {} from {} to {}", state.tripId(), origin.label(), destination.label());
        return toResponse(state);
    }

    public TripSessionResponse getTrip(String tripId) {
        return toResponse(requireTrip(tripId));
    }

    public TripSessionResponse advanceTrip(String tripId) {
        TripState current = requireTrip(tripId);
        int nextStep = Math.min(current.currentStep() + 1, current.frames().size() - 1);
        TripState updated = new TripState(
                current.tripId(),
                current.origin(),
                current.destination(),
                current.mode(),
                nextStep,
                current.frames(),
                current.routePath(),
                current.vehicleId()
        );
        trips.put(tripId, updated);
        log.debug("Trip {} advanced to step {}/{}", tripId, nextStep, current.frames().size() - 1);
        return toResponse(updated);
    }

    // ── Internal helpers ──────────────────────────────────────────────

    private TransitVehicle resolveDriverVehicle(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Driver authentication required");
        }
        return vehicleRepository.findFirstByDriverEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No vehicle assigned to this driver"));
    }

    private RouteMatch findBestRoute(TransportMode mode, GeocodedPlace origin, GeocodedPlace destination) {
        List<TransitRoute> routes = routeRepository.findByModeAndActiveTrue(mode);
        if (routes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No active routes found for " + mode.name());
        }

        RouteMatch bestMatch = null;
        for (TransitRoute route : routes) {
            List<TransitRouteStop> routeStops = routeStopRepository.findByRouteOrderBySequenceNumberAsc(route);
            List<StopPoint> stopPoints = routeStops.stream()
                    .map(routeStop -> new StopPoint(routeStop.getSequenceNumber(),
                            new GeocodedPlace(routeStop.getStop().getName(),
                                    routeStop.getStop().getLatitude(),
                                    routeStop.getStop().getLongitude())))
                    .toList();

            for (int boardingIndex = 0; boardingIndex < stopPoints.size(); boardingIndex++) {
                for (int alightingIndex = boardingIndex + 1; alightingIndex < stopPoints.size(); alightingIndex++) {
                    StopPoint boardingStop = stopPoints.get(boardingIndex);
                    StopPoint alightingStop = stopPoints.get(alightingIndex);

                    double walkStart = distanceMeters(origin.coordinate(), boardingStop.place().coordinate());
                    double walkEnd = distanceMeters(destination.coordinate(), alightingStop.place().coordinate());
                    double transitDistance = computeTransitDistance(stopPoints, boardingIndex, alightingIndex);
                    double score = walkStart + walkEnd + (transitDistance * 0.2);

                    TransitVehicle vehicle = nearestVehicle(route, boardingStop.place().coordinate());
                    RouteMatch candidate = new RouteMatch(
                            route,
                            boardingStop.place(),
                            alightingStop.place(),
                            stopPoints.subList(boardingIndex + 1, alightingIndex).stream().map(StopPoint::place).toList(),
                            vehicle,
                            walkStart + walkEnd + transitDistance,
                            transitDistance,
                            score
                    );

                    if (bestMatch == null || candidate.score() < bestMatch.score()) {
                        bestMatch = candidate;
                    }
                }
            }
        }

        if (bestMatch == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No matching Batangas City route found");
        }

        return bestMatch;
    }

    private TransitVehicle nearestVehicle(TransitRoute route, CoordinateResponse boardingPoint) {
        return vehicleRepository.findByRouteAndStatus(route, VehicleStatus.ACTIVE).stream()
                .min(Comparator.comparingDouble(vehicle -> locationRepository.findByVehicle(vehicle)
                        .map(location -> distanceMeters(boardingPoint,
                                new CoordinateResponse(location.getLatitude(), location.getLongitude())))
                        .orElse(Double.MAX_VALUE)))
                .orElse(null);
    }

    private List<SegmentResponse> buildPlannerSegments(
            RouteMatch match,
            GeocodedPlace origin,
            GeocodedPlace destination,
            double waitMinutes
    ) {
        LocalDateTime now = LocalDateTime.now();
        List<SegmentResponse> segments = new ArrayList<>();
        segments.add(new SegmentResponse(
                "walk",
                "Walk from " + origin.label() + " to " + match.boardingStop().label(),
                now.format(TIME_FORMAT)
        ));
        segments.add(new SegmentResponse(
                "alert",
                "Wait about " + Math.max(1, Math.round(waitMinutes)) + " min for " + vehicleLabel(match),
                now.plusMinutes(Math.max(1, Math.round(waitMinutes))).format(TIME_FORMAT)
        ));
        segments.add(new SegmentResponse(
                "ride",
                "Ride " + match.route().getDisplayName() + " from " + match.boardingStop().label() + " to " + match.alightingStop().label(),
                now.plusMinutes(Math.max(2, Math.round(waitMinutes + 3))).format(TIME_FORMAT)
        ));
        if (distanceMeters(match.alightingStop().coordinate(), destination.coordinate()) > 120) {
            segments.add(new SegmentResponse(
                    "walk",
                    "Walk from " + match.alightingStop().label() + " to " + destination.label(),
                    now.plusMinutes(Math.max(3, Math.round(waitMinutes + estimateRideMinutes(match.transitDistanceMeters(), match.route().getMode())))).format(TIME_FORMAT)
            ));
        }
        segments.add(new SegmentResponse(
                "arrive",
                "Arrive at " + destination.label(),
                now.plusMinutes(Math.max(4, Math.round(waitMinutes + estimateRideMinutes(match.transitDistanceMeters(), match.route().getMode())))).format(TIME_FORMAT)
        ));
        return segments;
    }

    private List<TripFrame> buildTripFrames(
            RouteMatch match,
            GeocodedPlace origin,
            GeocodedPlace destination,
            RouteResult route
    ) {
        List<CoordinateResponse> milestones = new ArrayList<>();
        milestones.add(origin.coordinate());
        milestones.add(match.boardingStop().coordinate());
        if (!match.intermediateStops().isEmpty()) {
            milestones.addAll(match.intermediateStops().stream().map(GeocodedPlace::coordinate).toList());
        }
        milestones.add(match.alightingStop().coordinate());
        milestones.add(destination.coordinate());

        List<TripFrame> frames = new ArrayList<>();
        for (int index = 0; index < milestones.size(); index++) {
            CoordinateResponse point = milestones.get(index);
            double progress = milestones.size() == 1 ? 1 : (double) index / (milestones.size() - 1);
            double remainingDistance = route.distanceMeters() * (1 - progress);
            double remainingMinutes = route.durationSeconds() / 60.0 * (1 - progress);

            String title;
            String subtitle;
            if (index == 0) {
                title = "Start from " + origin.label();
                subtitle = "Move to boarding stop " + match.boardingStop().label();
            } else if (index == 1) {
                title = "Board at " + match.boardingStop().label();
                subtitle = "Ride " + vehicleLabel(match);
            } else if (index == milestones.size() - 2) {
                title = "Alight at " + match.alightingStop().label();
                subtitle = "Final walk to " + destination.label();
            } else if (index == milestones.size() - 1) {
                title = "Arrived at " + destination.label();
                subtitle = "Trip completed";
            } else {
                title = "Passing " + match.intermediateStops().get(index - 2).label();
                subtitle = "Stay on " + match.route().getDisplayName();
            }

            frames.add(new TripFrame(
                    new TripStepResponse(
                            index == milestones.size() - 1 ? destination.label() : pointLabel(point, match, origin, destination),
                            title,
                            subtitle,
                            Math.max(0, Math.round(remainingMinutes)) + " min",
                            formatDistance(Math.max(0, remainingDistance)),
                            LocalDateTime.now().plusMinutes(Math.max(0, Math.round(remainingMinutes))).format(TIME_FORMAT),
                            index == 0 || index == milestones.size() - 1 ? "Track" : "Continue",
                            match.route().getDisplayName(),
                            index == 0 || index == milestones.size() - 1,
                            index == milestones.size() - 1
                    ),
                    point,
                    point,
                    point
            ));
        }
        return frames;
    }

    private TripState requireTrip(String tripId) {
        TripState state = trips.get(tripId);
        if (state == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found");
        }
        return state;
    }

    private TripSessionResponse toResponse(TripState state) {
        TripFrame frame = state.frames().get(state.currentStep());

        CoordinateResponse liveVehiclePosition = frame.vehiclePosition();
        String driverId = null;
        Long vehicleId = state.vehicleId();
        if (vehicleId != null) {
            TransitVehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
            if (vehicle != null) {
                driverId = vehicle.getDriverEmail();
                liveVehiclePosition = locationRepository.findByVehicle(vehicle)
                    .map(loc -> new CoordinateResponse(loc.getLatitude(), loc.getLongitude()))
                    .orElse(liveVehiclePosition);
            }
        }

        return new TripSessionResponse(
                state.tripId(),
                "Live Map",
                state.mode(),
                state.currentStep(),
                state.currentStep() >= state.frames().size() - 1,
                state.frames().stream().map(TripFrame::step).toList(),
                new TripStatusResponse(state.origin().label(), state.destination().label()),
                frame.mapCenter(),
                state.origin().coordinate(),
                state.destination().coordinate(),
                frame.currentPosition(),
                liveVehiclePosition,
                driverId,
                state.routePath()
        );
    }

    private TransportMode normalizeMode(String mode) {
        return mode == null ? TransportMode.TRICYCLE : TransportMode.valueOf(mode.trim().toUpperCase(Locale.ENGLISH));
    }

    private double estimateWaitingMinutes(RouteMatch match) {
        if (match.vehicle() == null) {
            return 8;
        }

        return locationRepository.findByVehicle(match.vehicle())
                .map(location -> distanceMeters(
                        new CoordinateResponse(location.getLatitude(), location.getLongitude()),
                        match.boardingStop().coordinate()
                ) / 220.0)
                .orElse(8.0);
    }

    private double estimateWalkingMinutes(CoordinateResponse origin, CoordinateResponse destination) {
        return distanceMeters(origin, destination) / 80.0;
    }

    private double estimateRideMinutes(double transitDistanceMeters, TransportMode mode) {
        double speedMetersPerMinute = mode == TransportMode.JEEPNEY ? 280.0 : 320.0;
        return transitDistanceMeters / speedMetersPerMinute;
    }

    private double computeTransitDistance(List<StopPoint> stopPoints, int fromIndex, int toIndex) {
        double total = 0;
        for (int index = fromIndex; index < toIndex; index++) {
            total += distanceMeters(stopPoints.get(index).place().coordinate(), stopPoints.get(index + 1).place().coordinate());
        }
        return total;
    }

    private String vehicleLabel(RouteMatch match) {
        return match.vehicle() == null ? match.route().getDisplayName() : match.vehicle().getLabel();
    }

    private String pointLabel(CoordinateResponse point, RouteMatch match, GeocodedPlace origin, GeocodedPlace destination) {
        if (samePoint(point, origin.coordinate())) {
            return origin.label();
        }
        if (samePoint(point, match.boardingStop().coordinate())) {
            return match.boardingStop().label();
        }
        if (samePoint(point, match.alightingStop().coordinate())) {
            return match.alightingStop().label();
        }
        if (samePoint(point, destination.coordinate())) {
            return destination.label();
        }
        return "Batangas City";
    }

    private String formatMinutes(double durationSeconds) {
        return Math.max(1, Math.round(durationSeconds / 60.0)) + " min";
    }

    private String formatDistance(double meters) {
        return String.format(Locale.ENGLISH, "%.1f km", meters / 1000.0);
    }

    private String describeVia(RouteResult result) {
        return result.roadNames().stream()
                .filter(name -> !name.isBlank())
                .findFirst()
                .map(name -> "Via " + name)
                .orElse("Via Batangas City road network");
    }

    private String inferTraffic(double durationSeconds, double baselineSeconds) {
        return durationSeconds <= baselineSeconds * 1.12 ? "Moderate Traffic" : "Heavy Traffic";
    }

    // ── Internal records ──────────────────────────────────────────────

    private record StopPoint(int sequenceNumber, GeocodedPlace place) {
    }

    private record RouteMatch(
            TransitRoute route,
            GeocodedPlace boardingStop,
            GeocodedPlace alightingStop,
            List<GeocodedPlace> intermediateStops,
            TransitVehicle vehicle,
            double totalDistanceMeters,
            double transitDistanceMeters,
            double score
    ) {
    }

    private record TripFrame(
            TripStepResponse step,
            CoordinateResponse mapCenter,
            CoordinateResponse currentPosition,
            CoordinateResponse vehiclePosition
    ) {
    }

    private record TripState(
            String tripId,
            GeocodedPlace origin,
            GeocodedPlace destination,
            String mode,
            int currentStep,
            List<TripFrame> frames,
            List<CoordinateResponse> routePath,
            Long vehicleId
    ) {
    }
}
