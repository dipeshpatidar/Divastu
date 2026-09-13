package com.indore.divyavastu.spaces.service;

import org.springframework.stereotype.Service;

@Service
public class GeofenceService {

    private static final double EARTH_RADIUS_METERS = 6371000;
    private static final double GEOFENCE_RADIUS_THRESHOLD_METERS = 150.0; // 150 meters tolerance

    /**
     * Checks if agent native GPS coordinates are within threshold meters of property PostGIS location
     */
    public boolean isWithinGeofence(double agentLat, double agentLng, double propertyLat, double propertyLng) {
        double dLat = Math.toRadians(propertyLat - agentLat);
        double dLng = Math.toRadians(propertyLng - agentLng);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(agentLat)) * Math.cos(Math.toRadians(propertyLat)) *
                        Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distanceMeters = EARTH_RADIUS_METERS * c;

        return distanceMeters <= GEOFENCE_RADIUS_THRESHOLD_METERS;
    }

    /**
     * Calculates precise distance in meters between agent GPS and property location
     */
    public double calculateDistanceMeters(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return EARTH_RADIUS_METERS * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
}