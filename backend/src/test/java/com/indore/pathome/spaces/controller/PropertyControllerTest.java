package com.indore.pathome.spaces.controller;

import com.indore.pathome.spaces.dto.ParsedPropertyDTO;
import com.indore.pathome.spaces.entity.Listing;
import com.indore.pathome.spaces.entity.ListingStatus;
import com.indore.pathome.spaces.entity.RentalDetails;
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
        when(propertyParserService.parse(anyString())).thenReturn(expectedDto);

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

    @Test
    public void createFromParsedPromptRejectsUnreviewedData() {
        ParsedPropertyDTO dto = new ParsedPropertyDTO();
        dto.setBhk("2 BHK");
        dto.setType("Flat");
        dto.setCity("Indore");
        dto.setSector("Vijay Nagar");
        dto.setOwnerPhone("+91 98260 12345");
        dto.setRentAmount(30000.0);
        dto.setDepositVal("60000 Security Deposit");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> propertyController.createFromParsedPrompt(dto));

        assertTrue(exception.getMessage().contains("administrator must review"));
        verifyNoInteractions(listingRepository);
    }

    @Test
    public void createFromParsedPromptMapsConfirmedExtractionWithoutDefaults() {
        ParsedPropertyDTO dto = new ParsedPropertyDTO();
        dto.setAdminVerified(true);
        dto.setTitle("2 BHK Flat in Vijay Nagar");
        dto.setDescription("Original admin-reviewed description");
        dto.setBhk("2 BHK");
        dto.setType("Flat");
        dto.setStatus("LIVE");
        dto.setCity("Indore");
        dto.setSector("Vijay Nagar");
        dto.setAddress("Vijay Nagar, Indore");
        dto.setOwnerName("Dipesh Patidar");
        dto.setOwnerPhone("+91 98260 12345");
        dto.setBathrooms("3 Baths");
        dto.setRentAmount(30000.0);
        dto.setDepositVal("1+1 60000 Security Deposit");
        dto.setBrokerageVal("₹15,000");
        dto.setBrokerageDays("15 Days");

        when(listingRepository.save(any(Listing.class))).thenAnswer(invocation -> {
            Listing listing = invocation.getArgument(0);
            listing.setId(42L);
            return listing;
        });

        ResponseEntity<Map<String, Object>> response = propertyController.createFromParsedPrompt(dto);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(42L, response.getBody().get("propertyId"));
        var listingCaptor = org.mockito.ArgumentCaptor.forClass(Listing.class);
        verify(listingRepository).save(listingCaptor.capture());
        RentalDetails saved = (RentalDetails) listingCaptor.getValue();
        assertEquals("Dipesh Patidar", saved.getOwnerName());
        assertEquals(3, saved.getBathroomCount());
        assertEquals(60000, saved.getSecurityDeposit().intValueExact());
        assertEquals(2, saved.getSecurityDepositMonths());
        assertEquals(15000, saved.getBrokerageAmount().intValueExact());
        assertEquals(15, saved.getBrokerageDays());
        verify(propertyParserService).confirmLocality("Indore", "Vijay Nagar", 30000.0);
    }
}
