package com.indore.pathome.spaces.service;

import com.indore.pathome.spaces.dto.ParsedPropertyDTO;
import com.indore.pathome.spaces.entity.Locality;
import com.indore.pathome.spaces.repository.LocalityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PropertyParserServiceBatchTest {

    @Mock
    private LocalityRepository localityRepository;

    private PropertyParserService parserService;

    @BeforeEach
    void setUp() {
        when(localityRepository.findAll()).thenReturn(Collections.emptyList());
        parserService = new PropertyParserService(localityRepository);
        parserService.initCache();
    }

    @Test
    @DisplayName("Should split and parse numbered prompts (1), 2., 3))")
    void testNumberedPromptsSplitting() {
        String multiPrompt = """
                1) 2 BHK Flat in Vijay Nagar, Rent: 18000, Owner: +91 98260 11111
                2) 3 BHK House in Palasia, Rent 35000, Phone: +91 98260 22222
                3) 1 RK Flat in Bhawarkua, Rent 8000, Call: +91 98260 33333
                """;

        List<ParsedPropertyDTO> results = parserService.parseBatch(multiPrompt);

        assertNotNull(results);
        assertEquals(3, results.size());

        // First listing
        assertEquals("2 BHK", results.get(0).getBhk());
        assertEquals("Vijay Nagar", results.get(0).getSector());
        assertEquals(18000.0, results.get(0).getRentAmount());
        assertEquals("+91 98260 11111", results.get(0).getOwnerPhone());

        // Second listing
        assertEquals("3 BHK", results.get(1).getBhk());
        assertEquals("Palasia", results.get(1).getSector());
        assertEquals(35000.0, results.get(1).getRentAmount());
        assertEquals("+91 98260 22222", results.get(1).getOwnerPhone());

        // Third listing
        assertEquals("1 RK Studio", results.get(2).getBhk());
        assertEquals("Bhawarkua", results.get(2).getSector());
        assertEquals(8000.0, results.get(2).getRentAmount());
        assertEquals("+91 98260 33333", results.get(2).getOwnerPhone());
    }

    @Test
    @DisplayName("Should split voice transcription prompts using 'next property' cue")
    void testVoiceTranscriptionSplitting() {
        String voicePrompt = "2 BHK in Vijay Nagar rent 18 hazar phone +91 98260 12345 next property 3 BHK in Palasia rent 35 hazar owner +91 98260 54321";

        List<ParsedPropertyDTO> results = parserService.parseBatch(voicePrompt);

        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals("2 BHK", results.get(0).getBhk());
        assertEquals(18000.0, results.get(0).getRentAmount());
        assertEquals("3 BHK", results.get(1).getBhk());
        assertEquals(35000.0, results.get(1).getRentAmount());
    }

    @Test
    @DisplayName("Should correctly normalize Hinglish rent terms (hazar and lakh)")
    void testHinglishRentNormalization() {
        String prompt = "3 BHK in Saket Nagar rent 25 hazar deposit 2 mahina owner +91 98260 99999";

        ParsedPropertyDTO dto = parserService.parseAndSave(prompt);

        assertNotNull(dto);
        assertEquals(25000.0, dto.getRentAmount());
        assertEquals("3 BHK", dto.getBhk());
        assertTrue(dto.getDepositVal().contains("2 Months Deposit"));
    }

    @Test
    @DisplayName("Should extract in-prompt photo URLs into mediaUrls field")
    void testInPromptUrlExtraction() {
        String prompt = "2 BHK in Vijay Nagar rent 20000 owner +91 98260 00000 photos https://res.cloudinary.com/pathome/properties/images/flat1.webp";

        List<ParsedPropertyDTO> batch = parserService.parseBatch(prompt);

        assertNotNull(batch);
        assertEquals(1, batch.size());
        assertEquals(1, batch.get(0).getMediaUrls().size());
        assertEquals("https://res.cloudinary.com/pathome/properties/images/flat1.webp", batch.get(0).getMediaUrls().get(0));
    }
}
