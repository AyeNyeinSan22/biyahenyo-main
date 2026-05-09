package biyahenyo.biyahenyo_backend.service;

import biyahenyo.biyahenyo_backend.model.Route;
import biyahenyo.biyahenyo_backend.repository.RouteRepository;
import biyahenyo.biyahenyo_backend.dto.RoutePlannerResponse;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class RouteService {

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
            // Enrich with traffic prediction for the start location
            trafficService.predictTraffic(start).ifPresent(t -> tricycle.setTrafficLevel(t.getTrafficLevel()));
            suggestions.add(tricycle);
        } catch (Exception e) {}
        
        try {
            RoutePlannerResponse jeepney = transportService.getRoutePlan("JEEPNEY", start, end);
            // Enrich with traffic prediction for the start location
            trafficService.predictTraffic(start).ifPresent(t -> jeepney.setTrafficLevel(t.getTrafficLevel()));
            suggestions.add(jeepney);
        } catch (Exception e) {}
        
        return suggestions;
    }
}
