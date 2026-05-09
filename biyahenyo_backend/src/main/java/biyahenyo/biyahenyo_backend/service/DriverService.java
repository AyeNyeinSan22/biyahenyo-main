package biyahenyo.biyahenyo_backend.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import biyahenyo.biyahenyo_backend.dto.CoordinateResponse;
import biyahenyo.biyahenyo_backend.dto.DriverLocationResponse;
import biyahenyo.biyahenyo_backend.dto.DriverLocationUpdateRequest;
import biyahenyo.biyahenyo_backend.model.DriverLocation;
import biyahenyo.biyahenyo_backend.model.TransitVehicle;
import biyahenyo.biyahenyo_backend.model.VehicleLocation;
import biyahenyo.biyahenyo_backend.repository.TransitStopRepository;
import biyahenyo.biyahenyo_backend.repository.TransitVehicleRepository;
import biyahenyo.biyahenyo_backend.repository.VehicleLocationRepository;

@Service
public class DriverService {

    private final Map<String, DriverLocation> driverLocations = new ConcurrentHashMap<>();
    private final TransitVehicleRepository vehicleRepository;
    private final VehicleLocationRepository locationRepository;
    private final TransitStopRepository stopRepository;

    public DriverService(
            TransitVehicleRepository vehicleRepository, 
            VehicleLocationRepository locationRepository,
            TransitStopRepository stopRepository
    ) {
        this.vehicleRepository = vehicleRepository;
        this.locationRepository = locationRepository;
        this.stopRepository = stopRepository;
    }

    public DriverLocationResponse updateLocation(DriverLocationUpdateRequest request, String authenticatedDriverId) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        String driverId = requireAuthenticatedDriverId(authenticatedDriverId);
        double latitude = requireLatitude(request.latitude());
        double longitude = requireLongitude(request.longitude());
        Integer etaMinutes = requireEta(request.etaMinutes());
        DriverLocation.TrafficCondition traffic = requireTraffic(request.traffic());

        DriverLocation location = new DriverLocation(
                driverId,
                latitude,
                longitude,
                etaMinutes,
                traffic,
                LocalDateTime.now());
        driverLocations.put(driverId, location);
        
        String label = locationLabelFromCoordinates(latitude, longitude, "En Route");
        return toResponse(location, true, label);
    }

    public DriverLocationResponse getLocation(String driverId) {
        String normalizedDriverId = normalizeDriverId(driverId);
        DriverLocation location = driverLocations.get(normalizedDriverId);
        if (location != null) {
            String label = locationLabelFromCoordinates(location.getLatitude(), location.getLongitude(), "En Route");
            return toResponse(location, true, label);
        }

        TransitVehicle vehicle = vehicleRepository.findFirstByDriverEmailIgnoreCase(normalizedDriverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver location not found"));
        VehicleLocation storedLocation = locationRepository.findByVehicle(vehicle)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver location not found"));

        return new DriverLocationResponse(
                vehicle.getLabel(),
                "Last known",
                false,
                storedLocation.getLatitude(),
                storedLocation.getLongitude(),
                null,
                "MODERATE");
    }

    private String requireAuthenticatedDriverId(String authenticatedDriverId) {
        if (authenticatedDriverId == null || authenticatedDriverId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Driver authentication required");
        }
        return authenticatedDriverId.trim();
    }

    private String normalizeDriverId(String driverId) {
        if (driverId == null || driverId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driverId is required");
        }
        return driverId.trim();
    }

    private double requireLatitude(Double latitude) {
        if (latitude == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Latitude is required");
        }
        if (latitude < -90 || latitude > 90) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Latitude must be between -90 and 90");
        }
        return latitude;
    }

    private double requireLongitude(Double longitude) {
        if (longitude == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Longitude is required");
        }
        if (longitude < -180 || longitude > 180) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Longitude must be between -180 and 180");
        }
        return longitude;
    }

    private Integer requireEta(Integer etaMinutes) {
        if (etaMinutes == null) {
            return null;
        }
        if (etaMinutes < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ETA must be greater than or equal to 0");
        }
        return etaMinutes;
    }

    private DriverLocation.TrafficCondition requireTraffic(String traffic) {
        if (traffic == null || traffic.isBlank()) {
            return DriverLocation.TrafficCondition.MODERATE;
        }
        try {
            return DriverLocation.TrafficCondition.valueOf(traffic.trim().toUpperCase(Locale.ENGLISH));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Traffic must be LIGHT, MODERATE, or HEAVY");
        }
    }

    private DriverLocationResponse toResponse(DriverLocation location, boolean live, String label) {
        return new DriverLocationResponse(
                label,
                "Just now",
                live,
                location.getLatitude(),
                location.getLongitude(),
                location.getEtaMinutes(),
                location.getTraffic() != null ? location.getTraffic().name() : null);
    }
    private String locationLabelFromCoordinates(double latitude, double longitude, String fallback) {
        CoordinateResponse current = new CoordinateResponse(latitude, longitude);
        return stopRepository.findAll().stream()
                .filter(stop -> distanceMeters(current, new CoordinateResponse(stop.getLatitude(), stop.getLongitude())) < 200)
                .min(Comparator.comparingDouble(stop -> distanceMeters(current, new CoordinateResponse(stop.getLatitude(), stop.getLongitude()))))
                .map(stop -> "At " + stop.getName())
                .orElse(fallback);
    }

    private double distanceMeters(CoordinateResponse a, CoordinateResponse b) {
        double earthRadius = 6371000;
        double lat1 = Math.toRadians(a.latitude());
        double lat2 = Math.toRadians(b.latitude());
        double deltaLat = Math.toRadians(b.latitude() - a.latitude());
        double deltaLon = Math.toRadians(b.longitude() - a.longitude());
        double haversine = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    }
}
