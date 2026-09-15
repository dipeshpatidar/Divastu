package com.indore.pathome.spaces.service;

import com.indore.pathome.spaces.dto.ParsedPropertyDTO;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PropertyParserServicePureTest {

    private final PropertyParserService parser = new PropertyParserService(null);

    @Test
    void parsesTheAdminPromptWithoutPersistentSideEffects() {
        String prompt = "2bhk flat on rent near bombay chemist infront of Infiniti hotel "
                + "mahalaxmi nagar rent is 30000 & the security deposit is 1+1 60000 "
                + "& the brokerage Fee is 15000 & possession date 20th of september west "
                + "facing Flat fully furnished flat Dipesh patidar owner 6263421859 & 3 bathroom";

        ParsedPropertyDTO dto = parser.parse(prompt);

        assertEquals("2 BHK", dto.getBhk());
        assertEquals("Flat", dto.getType());
        assertEquals("Mahalaxmi Nagar", dto.getSector());
        assertEquals("Indore", dto.getCity());
        assertEquals(30000.0, dto.getRentAmount());
        assertEquals("₹15,000", dto.getBrokerageVal());
        assertEquals("1+1 60000 Security Deposit", dto.getDepositVal());
        assertEquals("Dipesh Patidar", dto.getOwnerName());
        assertEquals("+91 62634 21859", dto.getOwnerPhone());
        assertEquals("West Facing", dto.getVastuFacing());
        assertEquals("Fully Furnished", dto.getFurnishingStatus());
        assertEquals("3 Baths", dto.getBathrooms());
        assertTrue(dto.isRequiresReview());
        assertTrue(dto.getMissingFields().contains("Pincode"));
        assertTrue(dto.getConflicts().isEmpty());
        assertTrue(!dto.isSavedToDatabase());
    }

    @Test
    void exposesConflictingRentsForAdministratorReview() {
        ParsedPropertyDTO dto = parser.parse(
                "2 BHK flat in Vijay Nagar rent 25000 and later rent 30000 owner +91 98260 12345");

        assertTrue(dto.isRequiresReview());
        assertTrue(dto.getConflicts().stream().anyMatch(value -> value.startsWith("Monthly Rent")));
    }
}
