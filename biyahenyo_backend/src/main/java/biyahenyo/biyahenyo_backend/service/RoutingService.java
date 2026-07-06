package biyahenyo.biyahenyo_backend.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import biyahenyo.biyahenyo_backend.dto.CoordinateResponse;

/**
 * Handles road-network routing via the OSRM public API.
 * Returns road distance, duration, polyline geometry, and road names.
 */
@Service
public class RoutingService {

    private static final Logger log = LoggerFactory.getLogger(RoutingService.class);
    private static final String OSRM_BASE = "https://router.project-osrm.org/route/v1/driving/";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Request road-network routes between an ordered list of waypoints.
     *
     * @param points      ordered waypoints (lon/lat pairs sent to OSRM)
     * @param alternatives number of alternative routes to request (0 = just the best)
     * @return routes sorted by duration (fastest first)
     */
    public List<RouteResult> routeBetween(List<CoordinateResponse> points, int alternatives) {
        String coordinates = points.stream()
                .map(point -> point.longitude() + "," + point.latitude())
                .reduce((left, right) -> left + ";" + right)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Route points are required"));

        String url = OSRM_BASE + coordinates
                + "?overview=full&steps=true&geometries=geojson&alternatives=" + alternatives;

        log.debug("OSRM request: {} waypoints, {} alternatives", points.size(), alternatives);
        JsonNode payload = getJson(url);

        JsonNode routes = payload.path("routes");
        if (!routes.isArray() || routes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "No road route found for the selected Batangas locations");
        }

        List<RouteResult> results = new ArrayList<>();
        for (JsonNode routeNode : routes) {
            List<CoordinateResponse> geometry = new ArrayList<>();
            for (JsonNode coordinate : routeNode.path("geometry").path("coordinates")) {
                geometry.add(new CoordinateResponse(coordinate.get(1).asDouble(), coordinate.get(0).asDouble()));
            }

            List<String> roadNames = new ArrayList<>();
            for (JsonNode legNode : routeNode.path("legs")) {
                for (JsonNode stepNode : legNode.path("steps")) {
                    String name = stepNode.path("name").asText("");
                    if (!name.isBlank()) {
                        roadNames.add(name);
                    }
                }
            }

            results.add(new RouteResult(
                    routeNode.path("distance").asDouble(),
                    routeNode.path("duration").asDouble(),
                    geometry,
                    roadNames
            ));
        }

        results.sort(Comparator.comparingDouble(RouteResult::durationSeconds));
        return results;
    }

    private JsonNode getJson(String url) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(20))
                .header("Accept", "application/json")
                .header("User-Agent", "biyahenyo-dev/1.0")
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Routing service request failed");
            }
            return objectMapper.readTree(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Routing service request interrupted", exception);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not contact routing service", exception);
        }
    }

    /**
     * Result of an OSRM routing request.
     */
    public record RouteResult(
            double distanceMeters,
            double durationSeconds,
            List<CoordinateResponse> geometry,
            List<String> roadNames
    ) {
    }
}
