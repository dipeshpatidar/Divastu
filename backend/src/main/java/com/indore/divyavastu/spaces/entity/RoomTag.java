package com.indore.divyavastu.spaces.entity;

public enum RoomTag {
    GENERAL("🌐 General / Untagged"),
    LIVING_ROOM("🛋️ Living Room"),
    MASTER_BEDROOM("🛏️ Master Bedroom"),
    BEDROOM("🛏️ Guest Bedroom"),
    KITCHEN("🍳 Modular Kitchen"),
    BATHROOM("🚿 Bathroom & Restroom"),
    BALCONY("🌅 Balcony & View"),
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
