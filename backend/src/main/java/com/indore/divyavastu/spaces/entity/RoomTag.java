package com.indore.divyavastu.spaces.entity;

public enum RoomTag {
    LIVING_ROOM("🛋️ Living Room"),
    BEDROOM("🛏️ Master Bedroom"),
    KITCHEN("🍳 Modular Kitchen"),
    BALCONY("🌳 Balcony & View"),
    EXTERIOR("🏢 Building Exterior"),
    AMENITIES("🏊 Society Amenities"),
    FLOOR_PLAN("📐 Floor Plan Blueprint");

    private final String displayName;

    RoomTag(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
