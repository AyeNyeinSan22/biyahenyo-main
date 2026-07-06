package biyahenyo.biyahenyo_backend.service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import biyahenyo.biyahenyo_backend.dto.CoordinateResponse;
import biyahenyo.biyahenyo_backend.model.TransitStop;
import biyahenyo.biyahenyo_backend.repository.TransitStopRepository;

/**
 * Handles place resolution: first checks local transit stops, then falls back
 * to Nominatim geocoding for arbitrary addresses within Batangas City.
 */
@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);
    private static final String NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

    private final TransitStopRepository stopRepository;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeocodingService(TransitStopRepository stopRepository) {
        this.stopRepository = stopRepository;
    }

    /**
     * Resolve a raw query string to a geocoded place.
     * Checks local stops first, then geocodes via Nominatim.
     */
    public GeocodedPlace resolvePlace(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            TransitStop defaultStop = stopRepository.findByNameIgnoreCase("SM City Batangas")
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Default stop not found"));
            return toPlace(defaultStop);
        }

        return stopRepository.findByNameIgnoreCase(rawQuery.trim())
                .map(this::toPlace)
                .orElseGet(() -> geocode(rawQuery));
    }

    /**
     * Reverse-lookup: find the nearest transit stop label for a set of coordinates.
     * Returns the fallback label if no stop is within 200m.
     */
    public String locationLabelFromCoordinates(double latitude, double longitude, String fallback) {
        CoordinateResponse current = new CoordinateResponse(latitude, longitude);
        return stopRepository.findAll().stream()
                .filter(stop -> biyahenyo.biyahenyo_backend.util.GeoUtil.distanceMeters(
                        current, new CoordinateResponse(stop.getLatitude(), stop.getLongitude())) < 200)
                .min(java.util.Comparator.comparingDouble(stop -> biyahenyo.biyahenyo_backend.util.GeoUtil.distanceMeters(
                        current, new CoordinateResponse(stop.getLatitude(), stop.getLongitude()))))
                .map(stop -> "At " + stop.getName())
                .orElse(fallback);
    }

    private GeocodedPlace geocode(String rawQuery) {
        String normalizedQuery = normalizePlaceQuery(rawQuery);
        String url = NOMINATIM_BASE
                + "?format=jsonv2&limit=1&countrycodes=ph&bounded=1&viewbox=121.02,13.84,121.14,13.70&q="
                + encode(normalizedQuery);

        log.debug("Geocoding query: {} -> {}", rawQuery, normalizedQuery);
        JsonNode results = getJson(url);

        if (!results.isArray() || results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Could not find place in Batangas City: " + rawQuery);
        }

        JsonNode first = results.get(0);
        return new GeocodedPlace(
                rawQuery.trim(),
                first.path("lat").asDouble(),
                first.path("lon").asDouble()
        );
    }

    private String normalizePlaceQuery(String rawQuery) {
        String query = rawQuery.trim();
        String lower = query.toLowerCase(Locale.ENGLISH);
        if (!lower.contains("batangas")) {
            return query + ", Batangas City, Batangas, Philippines";
        }
        if (!lower.contains("philippines")) {
            return query + ", Philippines";
        }
        return query;
    }

    private GeocodedPlace toPlace(TransitStop stop) {
        return new GeocodedPlace(stop.getName(), stop.getLatitude(), stop.getLongitude());
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
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Map service request failed");
            }
            return objectMapper.readTree(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Map service request interrupted", exception);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not contact map service", exception);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    /**
     * Immutable representation of a named geographic point.
     */
    public record GeocodedPlace(String label, double latitude, double longitude) {
        public CoordinateResponse coordinate() {
            return new CoordinateResponse(latitude, longitude);
        }
    }
}
