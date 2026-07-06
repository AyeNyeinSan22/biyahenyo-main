package biyahenyo.biyahenyo_backend.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import biyahenyo.biyahenyo_backend.dto.CoordinateResponse;

class GeoUtilTest {

    @Test
    void distanceMeters_betweenSamePoint_returnsZero() {
        CoordinateResponse point = new CoordinateResponse(13.7565, 121.0583);
        assertEquals(0.0, GeoUtil.distanceMeters(point, point), 0.001);
    }

    @Test
    void distanceMeters_knownDistance() {
        // ~1 km apart in Batangas City
        CoordinateResponse a = new CoordinateResponse(13.7565, 121.0583);
        CoordinateResponse b = new CoordinateResponse(13.7655, 121.0583);
        double distance = GeoUtil.distanceMeters(a, b);
        // 1 degree latitude ≈ 111 km, so 0.009 degrees ≈ ~1 km
        assertTrue(distance > 900 && distance < 1100,
                "Expected ~1 km, got " + distance + " meters");
    }

    @Test
    void samePoint_withIdenticalCoordinates_returnsTrue() {
        CoordinateResponse point = new CoordinateResponse(13.7565, 121.0583);
        assertTrue(GeoUtil.samePoint(point, point));
    }

    @Test
    void samePoint_withTinyDifference_returnsTrue() {
        CoordinateResponse a = new CoordinateResponse(13.7565, 121.0583);
        CoordinateResponse b = new CoordinateResponse(13.75655, 121.05835);
        assertTrue(GeoUtil.samePoint(a, b));
    }

    @Test
    void samePoint_withLargeDifference_returnsFalse() {
        CoordinateResponse a = new CoordinateResponse(13.7565, 121.0583);
        CoordinateResponse b = new CoordinateResponse(13.8000, 121.1000);
        assertFalse(GeoUtil.samePoint(a, b));
    }
}
