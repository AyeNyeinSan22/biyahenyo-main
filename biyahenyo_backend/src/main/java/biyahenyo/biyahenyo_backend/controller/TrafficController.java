package biyahenyo.biyahenyo_backend.controller;

import biyahenyo.biyahenyo_backend.model.TrafficData;
import biyahenyo.biyahenyo_backend.service.TrafficService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/traffic")
public class TrafficController {

    private final TrafficService trafficService;

    public TrafficController(TrafficService trafficService) {
        this.trafficService = trafficService;
    }

    @GetMapping("/predict")
    public Optional<TrafficData> predictTraffic(@RequestParam String location) {
        return trafficService.predictTraffic(location);
    }
}
