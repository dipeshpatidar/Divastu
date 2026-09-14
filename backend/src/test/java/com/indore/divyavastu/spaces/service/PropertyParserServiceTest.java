package com.indore.divyavastu.spaces.service;

import com.indore.divyavastu.spaces.dto.ParsedPropertyDTO;
import com.indore.divyavastu.spaces.entity.Locality;
import com.indore.divyavastu.spaces.repository.LocalityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class PropertyParserServiceTest {

    @Mock
    private LocalityRepository localityRepository;

    @InjectMocks
    private PropertyParserService propertyParserService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        when(localityRepository.findAll()).thenReturn(new ArrayList<>());
        when(localityRepository.findDistinctCities()).thenReturn(new ArrayList<>());
        propertyParserService.initCache();
    }

    @Test
    public void testNumericBhkParsing() {
        ParsedPropertyDTO dto = propertyParserService.parseAndSave("4bhk flat in Nanda Nagar for 18000");
        assertNotNull(dto);
        assertEquals("4 BHK", dto.getBhk());
        assertEquals("Flat", dto.getType());
        assertEquals("Nanda Nagar", dto.getSector());
        assertEquals(18000.0, dto.getRentAmount());
    }

    @Test
    public void testFractionalBhkParsing() {
        ParsedPropertyDTO dto = propertyParserService.parseAndSave("2.5 bhk flat in Vijay Nagar for 24000");
        assertNotNull(dto);
        assertEquals("2.5 BHK", dto.getBhk());
        assertEquals("Vijay Nagar", dto.getSector());
        assertEquals(24000.0, dto.getRentAmount());
    }

    @Test
    public void testWordBhkParsing() {
        ParsedPropertyDTO dto = propertyParserService.parseAndSave("three bhk house in Bhawarkua Indore for 28000");
        assertNotNull(dto);
        assertEquals("3 BHK", dto.getBhk());
        assertEquals("House", dto.getType());
        assertEquals("Indore", dto.getCity());
    }

    @Test
    public void testStudioAndDuplexParsing() {
        ParsedPropertyDTO studioDto = propertyParserService.parseAndSave("1 rk studio in Rau for 10k");
        assertEquals("1 RK Studio", studioDto.getBhk());
        assertEquals(10000.0, studioDto.getRentAmount());

        ParsedPropertyDTO duplexDto = propertyParserService.parseAndSave("duplex villa in Palasia for 50000");
        assertEquals("Duplex Villa", duplexDto.getBhk());
        assertEquals("House", duplexDto.getType());
    }

    @Test
    public void testVastuAndAmenitiesParsing() {
        ParsedPropertyDTO dto = propertyParserService.parseAndSave("2bhk in Vijay Nagar with balcony facing west for 20000");
        assertEquals("West Facing", dto.getVastuFacing());
        assertTrue(dto.getAmenities().contains("Balcony & City View"));
    }

    @Test
    public void testPostgresLocalityAutoSave() {
        when(localityRepository.findByCityIgnoreCaseAndSectorNameIgnoreCase(eq("Jaipur"), eq("Civil Lines")))
                .thenReturn(Optional.empty());

        Locality savedLocality = new Locality("Jaipur", "Civil Lines", "civil lines", 92, 22000.0);
        when(localityRepository.save(any(Locality.class))).thenReturn(savedLocality);

        ParsedPropertyDTO dto = propertyParserService.parseAndSave("2bhk in Civil Lines Jaipur for 22000");
        assertNotNull(dto);
        assertEquals("Jaipur", dto.getCity());
        assertEquals("Civil Lines", dto.getSector());
        assertTrue(dto.isSavedToDatabase());

        verify(localityRepository, times(1)).save(any(Locality.class));
    }

    @Test
    public void testUserComplexPromptParsing() {
        String prompt = "Premium 2bhk flat 525 sqft 15000 brokerage 30000 rent 1+1 security deposit owner name Piyushi Saha 458888248";
        ParsedPropertyDTO dto = propertyParserService.parseAndSave(prompt);

        assertNotNull(dto);
        assertEquals("2 BHK", dto.getBhk());
        assertEquals("Flat", dto.getType());
        assertEquals(30000.0, dto.getRentAmount());
        assertEquals("₹30,000", dto.getRentVal());
        assertEquals("₹15,000", dto.getBrokerageVal());
        assertEquals("525 sqft", dto.getAreaSqFt());
        assertEquals("1+1 Security Deposit", dto.getDepositVal());
        assertEquals("Piyushi Saha", dto.getOwnerName());
        assertEquals("458888248", dto.getOwnerPhone());
        assertEquals("Not Specified", dto.getVastuFacing());
    }

    @Test
    public void testFull18PlusAttributeExtractionAndMissingTelemetry() {
        String fullPrompt = "Premium 2bhk flat 525 sqft 15000 brokerage 30000 rent 1+1 security deposit owner name Piyushi Saha 9876543210 status live in Nanda Nagar Indore facing east fully furnished ready to move near Main Square 452010 3 bathrooms";
        ParsedPropertyDTO dto = propertyParserService.parseAndSave(fullPrompt);

        assertNotNull(dto);
        assertEquals("2 BHK", dto.getBhk());
        assertEquals("Flat", dto.getType());
        assertEquals(30000.0, dto.getRentAmount());
        assertEquals("₹15,000", dto.getBrokerageVal());
        assertEquals("525 sqft", dto.getAreaSqFt());
        assertEquals("1+1 Security Deposit", dto.getDepositVal());
        assertEquals("Piyushi Saha", dto.getOwnerName());
        assertEquals("9876543210", dto.getOwnerPhone());
        assertEquals("East Facing", dto.getVastuFacing());
        assertEquals("Fully Furnished", dto.getFurnishingStatus());
        assertEquals("Ready To Move", dto.getPossessionDate());
        assertEquals("LIVE", dto.getStatus());
        assertEquals("Nanda Nagar", dto.getSector());
        assertEquals("Indore", dto.getCity());
        assertEquals("452010", dto.getPincode());
        assertEquals("Main Square", dto.getLandmark());
        assertEquals("3 Baths", dto.getBathrooms());

        // Test partial prompt missing fields detection
        String partialPrompt = "2bhk flat in Nanda Nagar";
        ParsedPropertyDTO partialDto = propertyParserService.parseAndSave(partialPrompt);
        assertNotNull(partialDto);
        assertNotNull(partialDto.getMissingFields());
        assertTrue(partialDto.getMissingFields().contains("Bathrooms Count"));
        assertTrue(partialDto.getMissingFields().contains("Monthly Rent"));
    }
}
