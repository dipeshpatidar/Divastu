package com.indore.divyavastu.spaces.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class TenantRevenueServiceTest {

    private final TenantRevenueService service = new TenantRevenueService();

    @Test
    void testFirstFiveVisitsAreFree() {
        for (int visitSeq = 1; visitSeq <= 5; visitSeq++) {
            assertFalse(service.requiresCommitmentDeposit(visitSeq), "Visit " + visitSeq + " should be free");
            assertEquals(BigDecimal.ZERO, service.getCommitmentDepositAmount(visitSeq));
            assertEquals(0, BigDecimal.ZERO.compareTo(service.calculateTenantBrokerage(visitSeq, new BigDecimal("20000"))));
        }
    }

    @Test
    void testSixthVisitRequiresDepositAndBrokerage() {
        int visitSeq = 6;
        assertTrue(service.requiresCommitmentDeposit(visitSeq));
        assertEquals(new BigDecimal("100.00"), service.getCommitmentDepositAmount(visitSeq));

        BigDecimal monthlyRent = new BigDecimal("20000.00");
        BigDecimal expectedBrokerage = new BigDecimal("10000.00"); // 50%
        assertEquals(0, expectedBrokerage.compareTo(service.calculateTenantBrokerage(visitSeq, monthlyRent)));
    }

    @Test
    void testLandlordCommissionIs15DaysRent() {
        BigDecimal monthlyRent = new BigDecimal("20000.00");
        BigDecimal expectedLandlordCommission = new BigDecimal("10000.00"); // 15/30 days = 50%
        assertEquals(0, expectedLandlordCommission.compareTo(service.calculateLandlordCommission(monthlyRent)));
    }
}