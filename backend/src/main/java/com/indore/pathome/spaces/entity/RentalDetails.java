package com.indore.pathome.spaces.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_details")
@DiscriminatorValue("RENTAL")
public class RentalDetails extends Listing {

    @Column(name = "monthly_rent", nullable = false)
    private BigDecimal monthlyRent;

    @Column(name = "security_deposit", nullable = false)
    private BigDecimal securityDeposit;

    @Column(name = "maintenance_charge")
    private BigDecimal maintenanceCharge;

    @Column(name = "bachelor_allowed")
    private Boolean bachelorAllowed = true;

    @Column(name = "available_from")
    private LocalDateTime availableFrom;

    public RentalDetails() {
        setListingType(ListingType.RENT);
    }

    public BigDecimal getMonthlyRent() { return monthlyRent; }
    public void setMonthlyRent(BigDecimal monthlyRent) { this.monthlyRent = monthlyRent; }

    public BigDecimal getSecurityDeposit() { return securityDeposit; }
    public void setSecurityDeposit(BigDecimal securityDeposit) { this.securityDeposit = securityDeposit; }

    public BigDecimal getMaintenanceCharge() { return maintenanceCharge; }
    public void setMaintenanceCharge(BigDecimal maintenanceCharge) { this.maintenanceCharge = maintenanceCharge; }

    public Boolean getBachelorAllowed() { return bachelorAllowed; }
    public void setBachelorAllowed(Boolean bachelorAllowed) { this.bachelorAllowed = bachelorAllowed; }

    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDateTime availableFrom) { this.availableFrom = availableFrom; }
}
