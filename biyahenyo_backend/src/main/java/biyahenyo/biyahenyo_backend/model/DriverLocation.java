package biyahenyo.biyahenyo_backend.model;

import java.time.LocalDateTime;

public class DriverLocation {

    private String driverId;
    private double latitude;
    private double longitude;
    private Integer etaMinutes;
    private TrafficCondition traffic;
    private LocalDateTime updatedAt;

    public DriverLocation() {
    }

    public DriverLocation(String driverId, double latitude, double longitude, Integer etaMinutes, TrafficCondition traffic, LocalDateTime updatedAt) {
        this.driverId = driverId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.etaMinutes = etaMinutes;
        this.traffic = traffic;
        this.updatedAt = updatedAt;
    }

    public String getDriverId() {
        return driverId;
    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public Integer getEtaMinutes() {
        return etaMinutes;
    }

    public void setEtaMinutes(Integer etaMinutes) {
        this.etaMinutes = etaMinutes;
    }

    public TrafficCondition getTraffic() {
        return traffic;
    }

    public void setTraffic(TrafficCondition traffic) {
        this.traffic = traffic;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public enum TrafficCondition {
        LIGHT,
        MODERATE,
        HEAVY
    }
}
