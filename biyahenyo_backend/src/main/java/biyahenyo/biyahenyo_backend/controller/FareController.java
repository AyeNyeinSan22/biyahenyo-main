package biyahenyo.biyahenyo_backend.controller;

import biyahenyo.biyahenyo_backend.service.FareService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fare")
public class FareController {

    private final FareService fareService;

    public FareController(FareService fareService) {
        this.fareService = fareService;
    }

    @GetMapping("/estimate")
    public Double estimateFare(
            @RequestParam String vehicleType,
            @RequestParam Double distance,
            @RequestParam(defaultValue = "REGULAR") String passengerType
    ) {
        return fareService.estimateFare(vehicleType, distance, passengerType);
    }
}
