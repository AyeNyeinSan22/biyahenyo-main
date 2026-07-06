package biyahenyo.biyahenyo_backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import biyahenyo.biyahenyo_backend.dto.DriverDashboardResponse;
import biyahenyo.biyahenyo_backend.dto.DriverLocationResponse;
import biyahenyo.biyahenyo_backend.dto.DriverLocationUpdateRequest;
import biyahenyo.biyahenyo_backend.service.DriverService;
import biyahenyo.biyahenyo_backend.service.TransportService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/driver")
public class DriverController {

    private final TransportService transportService;
    private final DriverService driverService;

    public DriverController(TransportService transportService, DriverService driverService) {
        this.transportService = transportService;
        this.driverService = driverService;
    }

    @GetMapping("/dashboard")
    public DriverDashboardResponse dashboard(@AuthenticationPrincipal String email) {
        return transportService.getDriverDashboard(email);
    }

    @PostMapping("/location")
    public DriverDashboardResponse updateLocation(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody(required = false) DriverLocationUpdateRequest request
    ) {
        return transportService.updateDriverLocation(email, request);
    }

    @PostMapping("/update-location")
    public DriverLocationResponse updateDriverLiveLocation(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody(required = false) DriverLocationUpdateRequest request
    ) {
        return driverService.updateLocation(request, email);
    }

    @GetMapping("/location/{driverId}")
    public DriverLocationResponse getDriverLocation(@PathVariable String driverId) {
        return driverService.getLocation(driverId);
    }
}
