package com.indore.divyavastu.spaces.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "listings", indexes = {
    @Index(name = "idx_listing_status_sector", columnList = "status, sector"),
    @Index(name = "idx_listing_status_type", columnList = "status, listing_type"),
    @Index(name = "idx_listing_bhk", columnList = "status, bhk_count"),
    @Index(name = "idx_listing_owner_phone", columnList = "owner_phone_number")
})
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "listing_category", discriminatorType = DiscriminatorType.STRING)
public abstract class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type", nullable = false)
    private ListingType listingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false)
    private PropertyType propertyType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingStatus status = ListingStatus.ACTIVE;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String sector; // e.g. Vijay Nagar, Bhawarkua

    @Column(nullable = false)
    private String city = "Indore";

    @Column(name = "bhk_count", nullable = false)
    private String bhkCount;

    @Column(name = "furnishing_status")
    private String furnishingStatus;

    @Column(name = "vastu_facing")
    private String vastuFacing;

    @Column(columnDefinition = "TEXT")
    private String amenities;

    @Column(name = "total_area_sq_ft")
    private Double totalAreaSqFt;

    @Column(name = "media_gallery_urls", columnDefinition = "TEXT")
    private String mediaGalleryUrls;

    @Column(name = "owner_phone_number", nullable = false)
    private String ownerPhoneNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Listing() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ListingType getListingType() { return listingType; }
    public void setListingType(ListingType listingType) { this.listingType = listingType; }

    public PropertyType getPropertyType() { return propertyType; }
    public void setPropertyType(PropertyType propertyType) { this.propertyType = propertyType; }

    public ListingStatus getStatus() { return status; }
    public void setStatus(ListingStatus status) { this.status = status; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getBhkCount() { return bhkCount; }
    public void setBhkCount(String bhkCount) { this.bhkCount = bhkCount; }

    public String getFurnishingStatus() { return furnishingStatus; }
    public void setFurnishingStatus(String furnishingStatus) { this.furnishingStatus = furnishingStatus; }

    public String getVastuFacing() { return vastuFacing; }
    public void setVastuFacing(String vastuFacing) { this.vastuFacing = vastuFacing; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public Double getTotalAreaSqFt() { return totalAreaSqFt; }
    public void setTotalAreaSqFt(Double totalAreaSqFt) { this.totalAreaSqFt = totalAreaSqFt; }

    public String getMediaGalleryUrls() { return mediaGalleryUrls; }
    public void setMediaGalleryUrls(String mediaGalleryUrls) { this.mediaGalleryUrls = mediaGalleryUrls; }

    public String getOwnerPhoneNumber() { return ownerPhoneNumber; }
    public void setOwnerPhoneNumber(String ownerPhoneNumber) { this.ownerPhoneNumber = ownerPhoneNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
