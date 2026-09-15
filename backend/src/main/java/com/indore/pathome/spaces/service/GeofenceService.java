package com.indore.pathome.spaces.service;

import org.springframework.stereotype.Service;

/**
 * Geospatial verification service calculating Haversine distance and geofence tolerance thresholds.
 */
@Service
public class GeofenceService {

    private static final double EARTH_RADIUS_METERS = 6_371_000.0;
    private static final double GEOFENCE_RADIUS_THRESHOLD_METERS = 150.0;

    /**
     * Checks if native agent GPS coordinates fall within the 150-meter threshold of property location.
     */
    public boolean isWithinGeofence(double agentLat, double agentLng, double propertyLat, double propertyLng) {
        validateCoordinates(agentLat, agentLng);
        validateCoordinates(propertyLat, propertyLng);
        return calculateDistanceMeters(agentLat, agentLng, propertyLat, propertyLng) <= GEOFENCE_RADIUS_THRESHOLD_METERS;
    }

    /**
     * Calculates precise distance in meters between two GPS coordinate points using the Haversine formula.
     */
    public double calculateDistanceMeters(double lat1, double lng1, double lat2, double lng2) {
        validateCoordinates(lat1, lng1);
        validateCoordinates(lat2, lng2);

        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        return EARTH_RADIUS_METERS * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    private void validateCoordinates(double lat, double lng) {
        if (lat < -90.0 || lat > 90.0) {
            throw new IllegalArgumentException("Latitude must be between -90.0 and 90.0 degrees: " + lat);
        }
        if (lng < -180.0 || lng > 180.0) {
            throw new IllegalArgumentException("Longitude must be between -180.0 and 180.0 degrees: " + lng);
        }
    }
}