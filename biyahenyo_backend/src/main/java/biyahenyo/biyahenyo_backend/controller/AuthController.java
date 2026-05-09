package biyahenyo.biyahenyo_backend.controller;

import biyahenyo.biyahenyo_backend.dto.AuthResponse;
import biyahenyo.biyahenyo_backend.dto.LoginRequest;
import biyahenyo.biyahenyo_backend.dto.RegisterRequest;
import biyahenyo.biyahenyo_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;


    @PostMapping({"/register", "/register/"})
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }


    @PostMapping({"/login", "/login/"})
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(authService.currentUser(authentication.getName()));
    }
}
