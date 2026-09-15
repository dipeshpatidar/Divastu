package com.indore.pathome.spaces.controller;

import com.indore.pathome.spaces.dto.ParsedPropertyDTO;
import com.indore.pathome.spaces.entity.Listing;
import com.indore.pathome.spaces.entity.ListingStatus;
import com.indore.pathome.spaces.repository.ListingRepository;
import com.indore.pathome.spaces.repository.PropertyMediaAssetRepository;
import com.indore.pathome.spaces.service.CloudinaryService;
import com.indore.pathome.spaces.service.PropertyParserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class PropertyControllerTest {

    @Mock
    private ListingRepository listingRepository;

    @Mock
    private PropertyMediaAssetRepository mediaAssetRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private PropertyParserService propertyParserService;

    @InjectMocks
    private PropertyController propertyController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testParseNaturalLanguagePrompt_ReturnsParsedDTO() {
        ParsedPropertyDTO expectedDto = new ParsedPropertyDTO("3 BHK", "Flat", "Indore", "Vijay Nagar", "", "₹22,000", 22000.0, "East Facing", List.of(), "Title", "Label", true);
        when(propertyParserService.parseAndSave(anyString())).thenReturn(expectedDto);

        Map<String, String> request = Map.of("prompt", "3bhk in Vijay Nagar for 22000");
        ResponseEntity<ParsedPropertyDTO> response = propertyController.parseNaturalLanguagePrompt(request);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("3 BHK", response.getBody().getBhk());
        assertEquals("Vijay Nagar", response.getBody().getSector());
    }

    @Test
    public void testGetAllActiveProperties_ReturnsListings() {
        com.indore.pathome.spaces.entity.RentalDetails rental = new com.indore.pathome.spaces.entity.RentalDetails();
        rental.setTitle("Test Property");
        when(listingRepository.findByStatus(ListingStatus.ACTIVE)).thenReturn(List.of(rental));

        ResponseEntity<List<Listing>> response = propertyController.getAllActiveProperties(null, null);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertFalse(response.getBody().isEmpty());
    }
}
