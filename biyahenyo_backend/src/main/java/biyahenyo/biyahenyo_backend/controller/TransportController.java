package biyahenyo.biyahenyo_backend.controller;

import biyahenyo.biyahenyo_backend.model.TransportRoute;
import biyahenyo.biyahenyo_backend.service.TransportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

    private final TransportService transportService;

    public TransportController(TransportService transportService) {
        this.transportService = transportService;
    }

    @GetMapping("/jeepney")
    public List<TransportRoute> getJeepneyRoutes() {
        return transportService.getJeepneyRoutes();
    }

    @GetMapping("/tricycle")
    public List<TransportRoute> getTricycleRoutes() {
        return transportService.getTricycleRoutes();
    }
}
