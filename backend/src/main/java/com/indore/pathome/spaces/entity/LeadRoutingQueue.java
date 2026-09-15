package com.indore.pathome.spaces.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "lead_routing_queue", indexes = {
    @Index(name = "idx_lead_status_sector", columnList = "status, targetSector"),
    @Index(name = "idx_lead_employee", columnList = "assigned_employee_id")
})
public class LeadRoutingQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_name", nullable = false)
    private String tenantName;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "target_sector", nullable = false)
    private String targetSector;

    @Column(name = "budget")
    private BigDecimal budget;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadStatus status = LeadStatus.ASSIGNED;

    @ManyToOne
    @JoinColumn(name = "assigned_employee_id")
    private EmployeeProfile assignedEmployee;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public LeadRoutingQueue() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTenantName() { return tenantName; }
    public void setTenantName(String tenantName) { this.tenantName = tenantName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getTargetSector() { return targetSector; }
    public void setTargetSector(String targetSector) { this.targetSector = targetSector; }

    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }

    public LeadStatus getStatus() { return status; }
    public void setStatus(LeadStatus status) { this.status = status; }

    public EmployeeProfile getAssignedEmployee() { return assignedEmployee; }
    public void setAssignedEmployee(EmployeeProfile assignedEmployee) { this.assignedEmployee = assignedEmployee; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
