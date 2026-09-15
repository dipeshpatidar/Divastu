package com.indore.pathome.spaces.service;

import com.indore.pathome.spaces.entity.EmployeeProfile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Service calculating monthly payroll and deal incentive distributions for Ground Boys and WFH Admins.
 */
@Service
public class PayrollService {

    private static final BigDecimal GROUND_BOY_BASE_SALARY = new BigDecimal("15000.00");
    private static final BigDecimal GROUND_BOY_DEAL_INCENTIVE = new BigDecimal("1500.00");
    private static final BigDecimal WFH_ADMIN_BASE_SALARY = new BigDecimal("8000.00");

    public BigDecimal calculateGroundBoyPayout(int closedDealsCount) {
        if (closedDealsCount < 0) {
            throw new IllegalArgumentException("Closed deals count cannot be negative");
        }
        BigDecimal totalIncentive = GROUND_BOY_DEAL_INCENTIVE.multiply(BigDecimal.valueOf(closedDealsCount));
        return GROUND_BOY_BASE_SALARY.add(totalIncentive);
    }

    public BigDecimal calculateAdminPayout() {
        return WFH_ADMIN_BASE_SALARY;
    }

    public BigDecimal calculateEmployeeMonthlyPayout(EmployeeProfile employeeProfile) {
        Objects.requireNonNull(employeeProfile, "EmployeeProfile must not be null");

        String roleType = employeeProfile.getRoleType();
        if ("GROUND_BOY".equalsIgnoreCase(roleType)) {
            return calculateGroundBoyPayout(employeeProfile.getClosedDealsCount());
        } else if ("WFH_ADMIN".equalsIgnoreCase(roleType)) {
            return calculateAdminPayout();
        }

        return employeeProfile.getBaseSalary() != null ? employeeProfile.getBaseSalary() : BigDecimal.ZERO;
    }
}