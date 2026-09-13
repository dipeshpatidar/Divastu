package com.indore.divyavastu.spaces.service;

import com.indore.divyavastu.spaces.entity.EmployeeProfile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PayrollService {

    private static final BigDecimal GROUND_BOY_BASE_SALARY = new BigDecimal("15000.00");
    private static final BigDecimal GROUND_BOY_DEAL_INCENTIVE = new BigDecimal("1500.00");
    private static final BigDecimal WFH_ADMIN_BASE_SALARY = new BigDecimal("8000.00");

    public BigDecimal calculateGroundBoyPayout(int closedDealsCount) {
        BigDecimal totalIncentive = GROUND_BOY_DEAL_INCENTIVE.multiply(BigDecimal.valueOf(closedDealsCount));
        return GROUND_BOY_BASE_SALARY.add(totalIncentive);
    }

    public BigDecimal calculateAdminPayout() {
        return WFH_ADMIN_BASE_SALARY;
    }

    public BigDecimal calculateEmployeeMonthlyPayout(EmployeeProfile employeeProfile) {
        if ("GROUND_BOY".equalsIgnoreCase(employeeProfile.getRoleType())) {
            return calculateGroundBoyPayout(employeeProfile.getClosedDealsCount());
        } else if ("WFH_ADMIN".equalsIgnoreCase(employeeProfile.getRoleType())) {
            return calculateAdminPayout();
        }
        return employeeProfile.getBaseSalary();
    }
}