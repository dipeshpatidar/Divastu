package com.indore.divyavastu.spaces.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_visit_logs")
public class TenantVisitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private User tenant;

    @ManyToOne(optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(name = "visit_sequence_number", nullable = false)
    private Integer visitSequenceNumber;

    @Column(name = "commitment_deposit_paid", nullable = false)
    private Boolean commitmentDepositPaid = false;

    @Column(name = "commitment_deposit_amount")
    private BigDecimal commitmentDepositAmount = BigDecimal.ZERO;

    @Column(name = "txn_id")
    private String txnId;

    @Column(name = "otp_code")
    private String otpCode;

    @Column(name = "geofence_verified", nullable = false)
    private Boolean geofenceVerified = false;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public TenantVisitLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getTenant() { return tenant; }
    public void setTenant(User tenant) { this.tenant = tenant; }

    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }

    public Integer getVisitSequenceNumber() { return visitSequenceNumber; }
    public void setVisitSequenceNumber(Integer visitSequenceNumber) { this.visitSequenceNumber = visitSequenceNumber; }

    public Boolean getCommitmentDepositPaid() { return commitmentDepositPaid; }
    public void setCommitmentDepositPaid(Boolean commitmentDepositPaid) { this.commitmentDepositPaid = commitmentDepositPaid; }

    public BigDecimal getCommitmentDepositAmount() { return commitmentDepositAmount; }
    public void setCommitmentDepositAmount(BigDecimal commitmentDepositAmount) { this.commitmentDepositAmount = commitmentDepositAmount; }

    public String getTxnId() { return txnId; }
    public void setTxnId(String txnId) { this.txnId = txnId; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public Boolean getGeofenceVerified() { return geofenceVerified; }
    public void setGeofenceVerified(Boolean geofenceVerified) { this.geofenceVerified = geofenceVerified; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
