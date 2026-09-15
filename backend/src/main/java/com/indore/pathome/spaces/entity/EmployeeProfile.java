package com.indore.pathome.spaces.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "employee_profiles", indexes = {
    @Index(name = "idx_emp_assigned_sector", columnList = "assignedSector")
})
public class EmployeeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "role_type", nullable = false)
    private String roleType; // GROUND_BOY or WFH_ADMIN

    @Column(name = "assigned_sector")
    private String assignedSector; // e.g. Vijay Nagar, Bhawarkua

    @Column(name = "base_salary", nullable = false)
    private BigDecimal baseSalary; // 15000 for GROUND_BOY, 8000 for WFH_ADMIN

    @Column(name = "closed_deals_count", nullable = false)
    private Integer closedDealsCount = 0;

    public EmployeeProfile() {}

    public EmployeeProfile(User user, String roleType, String assignedSector, BigDecimal baseSalary) {
        this.user = user;
        this.roleType = roleType;
        this.assignedSector = assignedSector;
        this.baseSalary = baseSalary;
        this.closedDealsCount = 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getRoleType() { return roleType; }
    public void setRoleType(String roleType) { this.roleType = roleType; }

    public String getAssignedSector() { return assignedSector; }
    public void setAssignedSector(String assignedSector) { this.assignedSector = assignedSector; }

    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }

    public Integer getClosedDealsCount() { return closedDealsCount; }
    public void setClosedDealsCount(Integer closedDealsCount) { this.closedDealsCount = closedDealsCount; }
}
