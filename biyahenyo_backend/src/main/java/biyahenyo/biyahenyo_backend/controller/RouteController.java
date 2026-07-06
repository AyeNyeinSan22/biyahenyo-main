package biyahenyo.biyahenyo_backend.controller;

import biyahenyo.biyahenyo_backend.dto.RoutePlannerResponse;
import biyahenyo.biyahenyo_backend.dto.StartTripRequest;
import biyahenyo.biyahenyo_backend.dto.TripSessionResponse;
import biyahenyo.biyahenyo_backend.model.Route;
import biyahenyo.biyahenyo_backend.service.RouteService;
import biyahenyo.biyahenyo_backend.service.TransportService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/routes")
@Validated
public class RouteController {

    private final TransportService transportService;
    private final RouteService routeService;

    public RouteController(TransportService transportService, RouteService routeService) {
        this.transportService = transportService;
        this.routeService = routeService;
    }

    @GetMapping("/plan")
    public RoutePlannerResponse getPlan(
            @RequestParam(defaultValue = "TRICYCLE") @Size(max = 20) String mode,
            @RequestParam(defaultValue = "GCH (Golden Country Homes)") @Size(max = 200) String from,
            @RequestParam(defaultValue = "SM Batangas City") @Size(max = 200) String to
    ) {
        return transportService.getRoutePlan(mode, from, to);
    }

    @PostMapping("/trips/start")
    public TripSessionResponse startTrip(@Valid @RequestBody StartTripRequest request) {
        return transportService.startTrip(request);
    }

    @GetMapping("/trips/{tripId}")
    public TripSessionResponse getTrip(@PathVariable String tripId) {
        return transportService.getTrip(tripId);
    }

    @PostMapping("/trips/{tripId}/advance")
    public TripSessionResponse advanceTrip(@PathVariable String tripId) {
        return transportService.advanceTrip(tripId);
    }

    @GetMapping("/suggest")
    public List<RoutePlannerResponse> suggestRoutes(
            @RequestParam String start,
            @RequestParam String end
    ) {
        return routeService.suggestDynamicRoutes(start, end);
    }

    @GetMapping("/cheapest")
    public Route getCheapestRoute(
            @RequestParam String start,
            @RequestParam String end
    ) {
        return routeService.getCheapestRoute(start, end);
    }
}
