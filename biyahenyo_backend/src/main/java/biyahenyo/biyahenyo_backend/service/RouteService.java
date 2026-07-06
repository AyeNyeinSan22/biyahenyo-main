package biyahenyo.biyahenyo_backend.service;

import biyahenyo.biyahenyo_backend.model.Route;
import biyahenyo.biyahenyo_backend.repository.RouteRepository;
import biyahenyo.biyahenyo_backend.dto.RoutePlannerResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class RouteService {

    private static final Logger log = LoggerFactory.getLogger(RouteService.class);

    private final RouteRepository routeRepository;
    private final TransportService transportService;
    private final TrafficService trafficService;

    public RouteService(RouteRepository routeRepository, TransportService transportService, TrafficService trafficService) {
        this.routeRepository = routeRepository;
        this.transportService = transportService;
        this.trafficService = trafficService;
    }

    public List<Route> suggestRoutes(String start, String end) {
        return routeRepository.findByStartLocationAndEndLocation(start, end);
    }

    public Route getCheapestRoute(String start, String end) {
        List<Route> routes = routeRepository.findByStartLocationAndEndLocation(start, end);
        return routes.stream().findFirst().orElse(null);
    }

    public List<RoutePlannerResponse> suggestDynamicRoutes(String start, String end) {
        List<RoutePlannerResponse> suggestions = new ArrayList<>();

        try {
            RoutePlannerResponse tricycle = transportService.getRoutePlan("TRICYCLE", start, end);
            trafficService.predictTraffic(start).ifPresent(t -> tricycle.setTrafficLevel(t.getTrafficLevel()));
            suggestions.add(tricycle);
        } catch (Exception e) {
            log.warn("Failed to build tricycle route plan from {} to {}: {}", start, end, e.getMessage());
        }

        try {
            RoutePlannerResponse jeepney = transportService.getRoutePlan("JEEPNEY", start, end);
            trafficService.predictTraffic(start).ifPresent(t -> jeepney.setTrafficLevel(t.getTrafficLevel()));
            suggestions.add(jeepney);
        } catch (Exception e) {
            log.warn("Failed to build jeepney route plan from {} to {}: {}", start, end, e.getMessage());
        }

        return suggestions;
    }
}
