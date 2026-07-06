package biyahenyo.biyahenyo_backend.util;

import biyahenyo.biyahenyo_backend.dto.CoordinateResponse;

/**
 * Shared geospatial utilities used across services.
 */
public final class GeoUtil {

    private static final double EARTH_RADIUS_METERS = 6_371_000;

    private GeoUtil() {
    }

    /**
     * Calculate the great-circle distance between two points using the Haversine formula.
     *
     * @param a first coordinate
     * @param b second coordinate
     * @return distance in meters
     */
    public static double distanceMeters(CoordinateResponse a, CoordinateResponse b) {
        double lat1 = Math.toRadians(a.latitude());
        double lat2 = Math.toRadians(b.latitude());
        double deltaLat = Math.toRadians(b.latitude() - a.latitude());
        double deltaLon = Math.toRadians(b.longitude() - a.longitude());

        double haversine = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(lat1) * Math.cos(lat2)
                * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

        return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    }

    /**
     * Check if two points are within a small tolerance (approx 11 meters).
     */
    public static boolean samePoint(CoordinateResponse a, CoordinateResponse b) {
        return Math.abs(a.latitude() - b.latitude()) < 0.0001
                && Math.abs(a.longitude() - b.longitude()) < 0.0001;
    }
}
