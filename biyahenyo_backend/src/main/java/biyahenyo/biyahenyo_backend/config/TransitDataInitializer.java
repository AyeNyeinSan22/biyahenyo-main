package biyahenyo.biyahenyo_backend.config;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import biyahenyo.biyahenyo_backend.model.TransitRoute;
import biyahenyo.biyahenyo_backend.model.TransitRouteStop;
import biyahenyo.biyahenyo_backend.model.TransitStop;
import biyahenyo.biyahenyo_backend.model.TransitVehicle;
import biyahenyo.biyahenyo_backend.model.TransportMode;
import biyahenyo.biyahenyo_backend.model.VehicleLocation;
import biyahenyo.biyahenyo_backend.model.VehicleStatus;
import biyahenyo.biyahenyo_backend.repository.TransitRouteRepository;
import biyahenyo.biyahenyo_backend.repository.TransitRouteStopRepository;
import biyahenyo.biyahenyo_backend.repository.TransitStopRepository;
import biyahenyo.biyahenyo_backend.repository.TransitVehicleRepository;
import biyahenyo.biyahenyo_backend.repository.VehicleLocationRepository;

@Configuration
public class TransitDataInitializer {

    @Bean
    @SuppressWarnings("unused")
    CommandLineRunner seedTransitData(
            TransitStopRepository stopRepository,
            TransitRouteRepository routeRepository,
            TransitRouteStopRepository routeStopRepository,
            TransitVehicleRepository vehicleRepository,
            VehicleLocationRepository locationRepository
    ) {
        return args -> {
            if (stopRepository.count() > 0) {
                return;
            }

            ObjectMapper objectMapper = new ObjectMapper();

            Map<String, TransitStop> stops = new LinkedHashMap<>();
            for (SeedStop seedStop : readSeedFile(objectMapper, "seed/stops.json", new TypeReference<List<SeedStop>>() {})) {
                stops.put(seedStop.name(), saveStop(stopRepository, seedStop.name(), seedStop.latitude(), seedStop.longitude(), seedStop.areaLabel()));
            }

            Map<String, TransitRoute> routes = new LinkedHashMap<>();
            for (SeedRoute seedRoute : readSeedFile(objectMapper, "seed/routes.json", new TypeReference<List<SeedRoute>>() {})) {
                TransitRoute route = new TransitRoute();
                route.setCode(seedRoute.code());
                route.setDisplayName(seedRoute.displayName());
                route.setMode(TransportMode.valueOf(seedRoute.mode()));
                route.setOriginLabel(seedRoute.originLabel());
                route.setDestinationLabel(seedRoute.destinationLabel());
                route.setBaseFare(seedRoute.baseFare());
                route.setActive(seedRoute.active());
                route.setColor(seedRoute.color());
                route = routeRepository.save(route);
                routes.put(route.getCode(), route);

                for (int index = 0; index < seedRoute.stops().size(); index++) {
                    TransitStop stop = stops.get(seedRoute.stops().get(index));
                    if (stop == null) {
                        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unknown stop in seed route: " + seedRoute.stops().get(index));
                    }
                    saveRouteStop(routeStopRepository, route, stop, index + 1);
                }
            }

            for (SeedVehicle seedVehicle : readSeedFile(objectMapper, "seed/vehicles.json", new TypeReference<List<SeedVehicle>>() {})) {
                TransitRoute route = routes.get(seedVehicle.routeCode());
                if (route == null) {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unknown route code in seed vehicle: " + seedVehicle.routeCode());
                }

                TransitVehicle vehicle = new TransitVehicle();
                vehicle.setPlateNumber(seedVehicle.plateNumber());
                vehicle.setLabel(seedVehicle.label());
                vehicle.setDriverName(seedVehicle.driverName());
                vehicle.setDriverEmail(seedVehicle.driverEmail());
                vehicle.setStatus(VehicleStatus.valueOf(seedVehicle.status()));
                vehicle.setRoute(route);
                vehicle = vehicleRepository.save(vehicle);

                saveLocation(locationRepository, vehicle, seedVehicle.latitude(), seedVehicle.longitude());
            }
        };
    }

    private <T> T readSeedFile(ObjectMapper objectMapper, @NonNull String path, TypeReference<T> typeReference) throws Exception {
        ClassPathResource resource = new ClassPathResource(path);
        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, typeReference);
        }
    }

    private TransitStop saveStop(
            TransitStopRepository stopRepository,
            String name,
            double latitude,
            double longitude,
            String areaLabel
    ) {
        TransitStop stop = new TransitStop();
        stop.setName(name);
        stop.setLatitude(latitude);
        stop.setLongitude(longitude);
        stop.setAreaLabel(areaLabel);
        return stopRepository.save(stop);
    }

    private void saveRouteStop(
            TransitRouteStopRepository routeStopRepository,
            TransitRoute route,
            TransitStop stop,
            int sequenceNumber
    ) {
        TransitRouteStop routeStop = new TransitRouteStop();
        routeStop.setRoute(route);
        routeStop.setStop(stop);
        routeStop.setSequenceNumber(sequenceNumber);
        routeStopRepository.save(routeStop);
    }

    private void saveLocation(
            VehicleLocationRepository locationRepository,
            TransitVehicle vehicle,
            double latitude,
            double longitude
    ) {
        VehicleLocation location = new VehicleLocation();
        location.setVehicle(vehicle);
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        location.setUpdatedAt(LocalDateTime.now());
        locationRepository.save(location);
    }

    private record SeedStop(
            String name,
            double latitude,
            double longitude,
            String areaLabel
    ) {
    }

    private record SeedRoute(
            String code,
            String displayName,
            String mode,
            String originLabel,
            String destinationLabel,
            double baseFare,
            boolean active,
            String color,
            List<String> stops
    ) {
    }

    private record SeedVehicle(
            String plateNumber,
            String label,
            String driverName,
            String driverEmail,
            String status,
            String routeCode,
            double latitude,
            double longitude
    ) {
    }
}
