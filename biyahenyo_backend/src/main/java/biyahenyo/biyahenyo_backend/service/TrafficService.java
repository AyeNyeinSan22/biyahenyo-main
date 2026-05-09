package biyahenyo.biyahenyo_backend.service;

import biyahenyo.biyahenyo_backend.model.TrafficData;
import biyahenyo.biyahenyo_backend.repository.TrafficRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TrafficService {

    private final TrafficRepository trafficRepository;

    public TrafficService(TrafficRepository trafficRepository) {
        this.trafficRepository = trafficRepository;
    }

    public Optional<TrafficData> predictTraffic(String location) {
        // First check DB for manual overrides
        Optional<TrafficData> dbData = trafficRepository.findByLocation(location);
        if (dbData.isPresent()) return dbData;

        // Otherwise, use dynamic logic based on Batangas Map Hubs
        TrafficData dynamicData = new TrafficData();
        dynamicData.setLocation(location);
        
        String trafficLevel = "Light";
        String normalized = location.toLowerCase();
        
        if (normalized.contains("bayan") || normalized.contains("palengke") || normalized.contains("rizal")) {
            trafficLevel = "Heavy";
        } else if (normalized.contains("balagtas") || normalized.contains("rotonda") || normalized.contains("alangilan")) {
            trafficLevel = "Moderate";
        } else if (normalized.contains("sm city") || normalized.contains("pallocan")) {
            trafficLevel = "Moderate";
        } else if (normalized.contains("hilltop") || normalized.contains("diversion")) {
            trafficLevel = "Heavy";
        }
        
        dynamicData.setTrafficLevel(trafficLevel);
        return Optional.of(dynamicData);
    }
}
