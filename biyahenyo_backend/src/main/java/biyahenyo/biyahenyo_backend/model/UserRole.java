package biyahenyo.biyahenyo_backend.model;

public enum UserRole {
    USER("/home"),
    DRIVER("/driver/dashboard");

    private final String redirectPath;

    UserRole(String redirectPath) {
        this.redirectPath = redirectPath;
    }

    public String getRedirectPath() {
        return redirectPath;
    }
}
