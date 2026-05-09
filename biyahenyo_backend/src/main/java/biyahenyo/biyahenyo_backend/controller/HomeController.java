package biyahenyo.biyahenyo_backend.controller;

import biyahenyo.biyahenyo_backend.dto.HomeDashboardResponse;
import biyahenyo.biyahenyo_backend.service.TransportService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    private final TransportService transportService;

    public HomeController(TransportService transportService) {
        this.transportService = transportService;
    }

    @GetMapping("/dashboard")
    public HomeDashboardResponse dashboard(@AuthenticationPrincipal Object principal) {
        String email = principal instanceof String ? (String) principal : "guest";
        return transportService.getHomeDashboard(email);
    }
}
