package com.indore.divyavastu.spaces.controller;

import com.indore.divyavastu.spaces.entity.*;
import com.indore.divyavastu.spaces.repository.ListingRepository;
import com.indore.divyavastu.spaces.repository.PropertyMediaAssetRepository;
import com.indore.divyavastu.spaces.service.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/properties")
public class PropertyController {

    private final ListingRepository listingRepository;
    private final PropertyMediaAssetRepository mediaAssetRepository;
    private final CloudinaryService cloudinaryService;
    private final com.indore.divyavastu.spaces.service.PropertyParserService propertyParserService;

    public PropertyController(ListingRepository listingRepository,
                              PropertyMediaAssetRepository mediaAssetRepository,
                              CloudinaryService cloudinaryService,
                              com.indore.divyavastu.spaces.service.PropertyParserService propertyParserService) {
        this.listingRepository = listingRepository;
        this.mediaAssetRepository = mediaAssetRepository;
        this.cloudinaryService = cloudinaryService;
        this.propertyParserService = propertyParserService;
    }

    /**
     * GET /api/v1/properties - Fetch active property listings from PostgreSQL database
     */
    @GetMapping
    public ResponseEntity<List<Listing>> getAllActiveProperties(
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String city) {

        List<Listing> listings;
        if (sector != null && !sector.isBlank()) {
            listings = listingRepository.findBySectorIgnoreCase(sector.trim());
        } else {
            listings = listingRepository.findByStatus(ListingStatus.ACTIVE);
        }
        return ResponseEntity.ok(listings);
    }

    /**
     * GET /api/v1/properties/{id} - Fetch single property details
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPropertyById(@PathVariable Long id) {
        Optional<Listing> listingOpt = listingRepository.findById(id);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Property listing not found");
        }
        return ResponseEntity.ok(listingOpt.get());
    }

    /**
     * GET /api/v1/properties/{id}/tagged-media - Fetch rich tagged media assets
     */
    @GetMapping("/{id}/tagged-media")
    public ResponseEntity<List<PropertyMediaAsset>> getTaggedMediaAssets(@PathVariable Long id) {
        List<PropertyMediaAsset> assets = mediaAssetRepository.findByListingIdOrderByUploadedAtDesc(id);
        return ResponseEntity.ok(assets);
    }

    /**
     * POST /api/v1/properties/{id}/tagged-media - Upload single photo/video with metadata
     */
    @PostMapping("/{id}/tagged-media")
    public ResponseEntity<?> uploadTaggedMediaAsset(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "roomTag", defaultValue = "LIVING_ROOM") String roomTagStr,
            @RequestParam(value = "mediaType", defaultValue = "IMAGE") String mediaTypeStr,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "isPrimaryCover", defaultValue = "false") Boolean isPrimaryCover,
            @RequestParam(value = "sector", required = false) String sector,
            @RequestParam(value = "priceTag", required = false) String priceTag,
            @RequestParam(value = "vastuFacing", required = false) String vastuFacing) {

        Optional<Listing> listingOpt = listingRepository.findById(id);
        Listing listing = listingOpt.orElse(null);

        RoomTag roomTag;
        try {
            roomTag = RoomTag.valueOf(roomTagStr.toUpperCase());
        } catch (Exception e) {
            roomTag = RoomTag.LIVING_ROOM;
        }

        MediaType mediaType;
        try {
            mediaType = MediaType.valueOf(mediaTypeStr.toUpperCase());
        } catch (Exception e) {
            mediaType = MediaType.IMAGE;
        }

        String cdnUrl;
        if (mediaType == MediaType.VIDEO_WALKTHROUGH) {
            cdnUrl = cloudinaryService.uploadVideo(file);
        } else {
            cdnUrl = cloudinaryService.uploadImage(file);
        }

        PropertyMediaAsset asset = new PropertyMediaAsset();
        asset.setListingId(id);
        asset.setMediaUrl(cdnUrl);
        asset.setMediaType(mediaType);
        asset.setRoomTag(roomTag);
        asset.setCaption(caption != null && !caption.isBlank() ? caption.trim() : roomTag.getDisplayName());
        asset.setIsPrimaryCover(isPrimaryCover);
        asset.setSector(sector != null && !sector.isBlank() ? sector : (listing != null ? listing.getSector() : "Vijay Nagar"));
        asset.setCity("Indore");
        asset.setPriceTag(priceTag != null && !priceTag.isBlank() ? priceTag : "₹22,000 / month");
        asset.setVastuFacing(vastuFacing != null && !vastuFacing.isBlank() ? vastuFacing : "North-East Facing");
        asset.setVerificationStatus("VERIFIED_BY_GROUND_ESCORT");

        PropertyMediaAsset savedAsset = mediaAssetRepository.save(asset);

        // Also update Listing entity media_gallery_urls for legacy compatibility
        if (listing != null) {
            String existing = listing.getMediaGalleryUrls();
            String updated = (existing == null || existing.isBlank()) ? cdnUrl : existing + "," + cdnUrl;
            listing.setMediaGalleryUrls(updated);
            listingRepository.save(listing);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedAsset);
    }

    /**
     * POST /api/v1/properties - Admin Endpoint to create a new property listing
     */
    @PostMapping
    public ResponseEntity<Listing> createProperty(@RequestBody Map<String, Object> body) {
        RentalDetails rental = new RentalDetails();
        rental.setTitle((String) body.getOrDefault("title", "New Indore Property"));
        rental.setDescription((String) body.getOrDefault("description", "Vetted zero brokerage home"));
        rental.setAddress((String) body.getOrDefault("address", "Vijay Nagar Main Road"));
        rental.setSector((String) body.getOrDefault("sector", "Vijay Nagar"));
        rental.setOwnerPhoneNumber((String) body.getOrDefault("ownerPhoneNumber", "+91 98260 00000"));
        rental.setLatitude(Double.valueOf(body.getOrDefault("latitude", 22.7533).toString()));
        rental.setLongitude(Double.valueOf(body.getOrDefault("longitude", 75.8937).toString()));
        rental.setTotalAreaSqFt(Double.valueOf(body.getOrDefault("totalAreaSqFt", 1500).toString()));
        rental.setMonthlyRent(new BigDecimal(body.getOrDefault("monthlyRent", "20000").toString()));
        rental.setSecurityDeposit(new BigDecimal(body.getOrDefault("securityDeposit", "40000").toString()));
        rental.setStatus(ListingStatus.ACTIVE);

        Listing saved = listingRepository.save(rental);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * POST /api/v1/properties/{id}/photos - Admin Upload Property Photos to Cloudinary
     */
    @PostMapping("/{id}/photos")
    public ResponseEntity<?> uploadPhotos(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files) {

        Optional<Listing> listingOpt = listingRepository.findById(id);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Listing not found");
        }

        Listing listing = listingOpt.get();
        List<String> uploadedUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            String cdnUrl = cloudinaryService.uploadImage(file);
            uploadedUrls.add(cdnUrl);

            // Save default tagged media asset
            PropertyMediaAsset asset = new PropertyMediaAsset(id, cdnUrl, MediaType.IMAGE, RoomTag.LIVING_ROOM, "Property Photo");
            asset.setSector(listing.getSector());
            asset.setPriceTag("₹22,000 / mo");
            mediaAssetRepository.save(asset);
        }

        String existing = listing.getMediaGalleryUrls();
        String updatedGallery = (existing == null || existing.isBlank())
                ? String.join(",", uploadedUrls)
                : existing + "," + String.join(",", uploadedUrls);

        listing.setMediaGalleryUrls(updatedGallery);
        listingRepository.save(listing);

        return ResponseEntity.ok(Map.of(
                "message", "Photos uploaded to Cloudinary successfully",
                "urls", uploadedUrls,
                "propertyId", id
        ));
    }

    /**
     * POST /api/v1/properties/{id}/video - Admin Upload Video Walkthrough to Cloudinary
     */
    @PostMapping("/{id}/video")
    public ResponseEntity<?> uploadVideo(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Optional<Listing> listingOpt = listingRepository.findById(id);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Listing not found");
        }

        Listing listing = listingOpt.get();
        String videoUrl = cloudinaryService.uploadVideo(file);

        // Save default tagged video asset
        PropertyMediaAsset asset = new PropertyMediaAsset(id, videoUrl, MediaType.VIDEO_WALKTHROUGH, RoomTag.LIVING_ROOM, "HD Video Walkthrough");
        asset.setSector(listing.getSector());
        asset.setPriceTag("₹22,000 / mo");
        mediaAssetRepository.save(asset);

        String existing = listing.getMediaGalleryUrls();
        String updatedGallery = (existing == null || existing.isBlank())
                ? videoUrl
                : existing + "," + videoUrl;

        listing.setMediaGalleryUrls(updatedGallery);
        listingRepository.save(listing);

        return ResponseEntity.ok(Map.of(
                "message", "Video walkthrough uploaded to Cloudinary successfully",
                "videoUrl", videoUrl,
                "propertyId", id
        ));
    }

    /**
     * POST /api/v1/properties/parse-prompt - Backend Natural Language Property Parser & Locality Database Auto-Save
     */
    @PostMapping("/parse-prompt")
    public ResponseEntity<com.indore.divyavastu.spaces.dto.ParsedPropertyDTO> parseNaturalLanguagePrompt(
            @RequestBody Map<String, String> request) {

        String prompt = request.get("prompt");
        com.indore.divyavastu.spaces.dto.ParsedPropertyDTO result = propertyParserService.parseAndSave(prompt);
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/v1/properties/create-from-parsed - Persist verified ParsedPropertyDTO to PostgreSQL DB listings
     */
    @PostMapping("/create-from-parsed")
    public ResponseEntity<Map<String, Object>> createFromParsedPrompt(@RequestBody com.indore.divyavastu.spaces.dto.ParsedPropertyDTO dto) {
        com.indore.divyavastu.spaces.entity.RentalDetails listing = new com.indore.divyavastu.spaces.entity.RentalDetails();
        listing.setTitle(dto.getTitle() != null ? dto.getTitle() : "Property Listing");
        listing.setDescription(dto.getDescription());
        listing.setSector(dto.getSector() != null ? dto.getSector() : "Vijay Nagar");
        listing.setAddress(dto.getAddress() != null ? dto.getAddress() : dto.getSector());
        listing.setMonthlyRent(java.math.BigDecimal.valueOf(dto.getRentAmount() != null ? dto.getRentAmount() : 18000.0));
        listing.setSecurityDeposit(java.math.BigDecimal.valueOf((dto.getRentAmount() != null ? dto.getRentAmount() : 18000.0) * 2));
        listing.setOwnerPhoneNumber(dto.getOwnerPhone() != null ? dto.getOwnerPhone() : "+91 98765 43210");
        listing.setLatitude(22.7533);
        listing.setLongitude(75.8937);
        listing.setStatus(com.indore.divyavastu.spaces.entity.ListingStatus.ACTIVE);
        
        com.indore.divyavastu.spaces.entity.Listing saved = listingRepository.save(listing);
        
        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "message", "Property created and mapped to PostgreSQL listings & rental_details tables",
            "propertyId", saved.getId(),
            "parsedDto", dto
        ));
    }
}
