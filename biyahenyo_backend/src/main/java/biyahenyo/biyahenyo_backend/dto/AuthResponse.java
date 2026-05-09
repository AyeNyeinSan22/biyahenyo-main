package biyahenyo.biyahenyo_backend.dto;

import biyahenyo.biyahenyo_backend.model.User;

public class AuthResponse {
    private final Long id;
    private final String fullName;
    private final String email;
    private final String role;
    private final String redirectPath;
    private final String token;
    private final String message;

    public AuthResponse(
            Long id,
            String fullName,
            String email,
            String role,
            String redirectPath,
            String token,
            String message
    ) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.redirectPath = redirectPath;
        this.token = token;
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getRedirectPath() {
        return redirectPath;
    }

    public String getToken() {
        return token;
    }

    public String getMessage() {
        return message;
    }

    public static AuthResponse fromUser(User user, String token, String message) {
        return new AuthResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole().name(),
            user.getRole().getRedirectPath(),
            token,
            message
        );
    }
}
