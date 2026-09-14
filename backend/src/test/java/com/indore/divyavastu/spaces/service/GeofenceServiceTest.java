package com.indore.divyavastu.spaces.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class GeofenceServiceTest {

    private GeofenceService geofenceService;

    @BeforeEach
    public void setUp() {
        geofenceService = new GeofenceService();
    }

    @Test
    public void testIsWithinGeofence_InsideThreshold_ReturnsTrue() {
        // Vijay Nagar, Indore coordinates (~50 meters apart)
        double agentLat = 22.7533;
        double agentLng = 75.8937;
        double propertyLat = 22.7535;
        double propertyLng = 75.8939;

        boolean inside = geofenceService.isWithinGeofence(agentLat, agentLng, propertyLat, propertyLng);
        assertTrue(inside, "Agent should be within 150m geofence threshold");
    }

    @Test
    public void testIsWithinGeofence_OutsideThreshold_ReturnsFalse() {
        // Vijay Nagar to Rau (~15 km apart)
        double agentLat = 22.7533;
        double agentLng = 75.8937;
        double propertyLat = 22.6288;
        double propertyLng = 75.8172;

        boolean inside = geofenceService.isWithinGeofence(agentLat, agentLng, propertyLat, propertyLng);
        assertFalse(inside, "Agent should be outside geofence threshold for distant location");
    }

    @Test
    public void testCalculateDistanceMeters_SameLocation_ReturnsZero() {
        double dist = geofenceService.calculateDistanceMeters(22.7533, 75.8937, 22.7533, 75.8937);
        assertEquals(0.0, dist, 0.01);
    }
}
