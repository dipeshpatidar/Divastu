package com.indore.divyavastu.spaces.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "sale_details")
@DiscriminatorValue("SALE")
public class SaleDetails extends Listing {

    @Column(name = "asking_price", nullable = false)
    private BigDecimal askingPrice;

    @Column(name = "price_per_sq_ft")
    private BigDecimal pricePerSqFt;

    @Column(name = "zoning_attributes")
    private String zoningAttributes; // e.g. Residential R1, Commercial, Agricultural

    @Column(name = "boundary_wall")
    private Boolean boundaryWall;

    @Column(name = "ownership_type")
    private String ownershipType; // e.g. FREEHOLD, LEASEHOLD

    public SaleDetails() {
        setListingType(ListingType.SALE);
    }

    public BigDecimal getAskingPrice() { return askingPrice; }
    public void setAskingPrice(BigDecimal askingPrice) { this.askingPrice = askingPrice; }

    public BigDecimal getPricePerSqFt() { return pricePerSqFt; }
    public void setPricePerSqFt(BigDecimal pricePerSqFt) { this.pricePerSqFt = pricePerSqFt; }

    public String getZoningAttributes() { return zoningAttributes; }
    public void setZoningAttributes(String zoningAttributes) { this.zoningAttributes = zoningAttributes; }

    public Boolean getBoundaryWall() { return boundaryWall; }
    public void setBoundaryWall(Boolean boundaryWall) { this.boundaryWall = boundaryWall; }

    public String getOwnershipType() { return ownershipType; }
    public void setOwnershipType(String ownershipType) { this.ownershipType = ownershipType; }
}
