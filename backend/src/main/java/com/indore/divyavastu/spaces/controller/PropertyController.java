package com.indore.divyavastu.spaces.controller;

import com.indore.divyavastu.spaces.dto.ParsedPropertyDTO;
import com.indore.divyavastu.spaces.entity.*;
import com.indore.divyavastu.spaces.repository.ListingRepository;
import com.indore.divyavastu.spaces.repository.PropertyMediaAssetRepository;
import com.indore.divyavastu.spaces.service.CloudinaryService;
import com.indore.divyavastu.spaces.service.PropertyParserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;

/**
 * Controller providing RESTful endpoints for property listings, media assets, and AI natural language parsing.
 */
@RestController
@RequestMapping("/api/v1/properties")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PropertyController {

    private final ListingRepository listingRepository;
    private final PropertyMediaAssetRepository mediaAssetRepository;
    private final CloudinaryService cloudinaryService;
    private final PropertyParserService propertyParserService;

    public PropertyController(
            ListingRepository listingRepository,
            PropertyMediaAssetRepository mediaAssetRepository,
            CloudinaryService cloudinaryService,
            PropertyParserService propertyParserService) {
        this.listingRepository = Objects.requireNonNull(listingRepository, "ListingRepository must not be null");
        this.mediaAssetRepository = Objects.requireNonNull(mediaAssetRepository, "PropertyMediaAssetRepository must not be null");
        this.cloudinaryService = Objects.requireNonNull(cloudinaryService, "CloudinaryService must not be null");
        this.propertyParserService = Objects.requireNonNull(propertyParserService, "PropertyParserService must not be null");
    }

    /**
     * GET /api/v1/properties - Fetch active property listings.
     */
    @GetMapping
    public ResponseEntity<List<Listing>> getAllActiveProperties(
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String city) {

        List<Listing> listings = (sector != null && !sector.isBlank())
                ? listingRepository.findBySectorIgnoreCase(sector.trim())
                : listingRepository.findByStatus(ListingStatus.ACTIVE);

        return ResponseEntity.ok(listings);
    }

    /**
     * GET /api/v1/properties/{id} - Fetch single property details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPropertyById(@PathVariable Long id) {
        return listingRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Property listing not found"));
    }

    /**
     * GET /api/v1/properties/{id}/tagged-media - Fetch rich tagged media assets.
     */
    @GetMapping("/{id}/tagged-media")
    public ResponseEntity<List<PropertyMediaAsset>> getTaggedMediaAssets(@PathVariable Long id) {
        return ResponseEntity.ok(mediaAssetRepository.findByListingIdOrderByUploadedAtDesc(id));
    }

    /**
     * POST /api/v1/properties/{id}/tagged-media - Upload single photo/video with metadata.
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

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Uploaded file cannot be null or empty");
        }

        Listing listing = listingRepository.findById(id).orElse(null);
        RoomTag roomTag = parseRoomTag(roomTagStr);
        MediaType mediaType = parseMediaType(mediaTypeStr);

        String cdnUrl = uploadMediaToCloudinary(file, mediaType);
        PropertyMediaAsset savedAsset = saveMediaAsset(id, cdnUrl, mediaType, roomTag, caption, isPrimaryCover, sector, priceTag, vastuFacing, listing);

        updateListingGallery(listing, cdnUrl);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedAsset);
    }

    /**
     * POST /api/v1/properties - Admin Endpoint to create a new property listing.
     */
    @PostMapping
    public ResponseEntity<Listing> createProperty(@RequestBody Map<String, Object> body) {
        Objects.requireNonNull(body, "Property payload must not be null");

        String ownerPhone = (String) body.get("ownerPhoneNumber");
        String sector = (String) body.get("sector");
        Object rentObj = body.getOrDefault("monthlyRent", body.get("price"));
        String bhkCount = (String) body.getOrDefault("bhkCount", body.get("bhk"));

        validateRequiredFields(ownerPhone, sector, rentObj, bhkCount);

        RentalDetails rental = new RentalDetails();
        rental.setTitle((String) body.getOrDefault("title", bhkCount + " Flat in " + sector));
        rental.setDescription((String) body.getOrDefault("description", "Vetted zero brokerage home in " + sector));
        rental.setAddress((String) body.getOrDefault("address", sector + ", Indore"));
        rental.setSector(sector);
        rental.setCity((String) body.getOrDefault("city", "Indore"));
        rental.setBhkCount(bhkCount);
        rental.setFurnishingStatus((String) body.getOrDefault("furnishingStatus", "Semi-Furnished"));
        rental.setVastuFacing((String) body.getOrDefault("vastuFacing", "North-East Facing"));
        if (body.containsKey("amenities")) {
            Object am = body.get("amenities");
            rental.setAmenities(am instanceof List ? String.join(", ", (List<String>) am) : am.toString());
        }
        rental.setOwnerPhoneNumber(ownerPhone.trim());
        rental.setLatitude(Double.valueOf(body.getOrDefault("latitude", 22.7533).toString()));
        rental.setLongitude(Double.valueOf(body.getOrDefault("longitude", 75.8937).toString()));
        rental.setTotalAreaSqFt(Double.valueOf(body.getOrDefault("totalAreaSqFt", 1500).toString()));
        rental.setMonthlyRent(new BigDecimal(rentObj.toString().replaceAll("[^0-9.]", "")));
        rental.setSecurityDeposit(new BigDecimal(body.getOrDefault("securityDeposit", String.valueOf(rental.getMonthlyRent().doubleValue() * 2)).toString()));
        rental.setStatus(ListingStatus.ACTIVE);
        rental.setPropertyType(PropertyType.FLAT);

        Listing saved = listingRepository.save(rental);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * POST /api/v1/properties/{id}/photos - Admin Upload Property Photos to Cloudinary.
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
        List<String> uploadedUrls = processPhotoUploads(id, files, listing);
        updateListingGalleryList(listing, uploadedUrls);

        return ResponseEntity.ok(Map.of(
                "message", "Photos uploaded to Cloudinary successfully",
                "urls", uploadedUrls,
                "propertyId", id
        ));
    }

    /**
     * POST /api/v1/properties/{id}/video - Admin Upload Video Walkthrough to Cloudinary.
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

        PropertyMediaAsset asset = new PropertyMediaAsset(id, videoUrl, MediaType.VIDEO_WALKTHROUGH, RoomTag.LIVING_ROOM, "HD Video Walkthrough");
        asset.setSector(listing.getSector());
        asset.setPriceTag("₹22,000 / mo");
        mediaAssetRepository.save(asset);

        updateListingGallery(listing, videoUrl);

        return ResponseEntity.ok(Map.of(
                "message", "Video walkthrough uploaded to Cloudinary successfully",
                "videoUrl", videoUrl,
                "propertyId", id
        ));
    }

    /**
     * POST /api/v1/properties/parse-prompt - Backend Natural Language Property Parser & Locality Auto-Save.
     */
    @PostMapping("/parse-prompt")
    public ResponseEntity<ParsedPropertyDTO> parseNaturalLanguagePrompt(@RequestBody Map<String, String> request) {
        if (request == null || !request.containsKey("prompt")) {
            return ResponseEntity.badRequest().build();
        }
        ParsedPropertyDTO result = propertyParserService.parseAndSave(request.get("prompt"));
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/v1/properties/create-from-parsed - Persist verified ParsedPropertyDTO to PostgreSQL DB listings.
     */
    @PostMapping("/create-from-parsed")
    public ResponseEntity<Map<String, Object>> createFromParsedPrompt(@RequestBody ParsedPropertyDTO dto) {
        Objects.requireNonNull(dto, "ParsedPropertyDTO must not be null");

        RentalDetails listing = buildRentalDetailsFromDTO(dto);
        Listing saved = listingRepository.save(listing);

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Property created and mapped to PostgreSQL listings & rental_details tables",
                "propertyId", saved.getId(),
                "parsedDto", dto
        ));
    }

    private void validateRequiredFields(String ownerPhone, String sector, Object rentObj, String bhkCount) {
        List<String> missing = new ArrayList<>();

        if (ownerPhone == null || ownerPhone.isBlank() || ownerPhone.equalsIgnoreCase("Not Specified") || ownerPhone.equalsIgnoreCase("Unspecified")) {
            missing.add("Owner Phone Number (Must not be null)");
        } else if (!ownerPhone.trim().startsWith("+")) {
            missing.add("Owner Phone Country Code (Prefix '+' required, e.g. +91 98260 12345)");
        }

        if (sector == null || sector.isBlank() || sector.equalsIgnoreCase("Not Specified") || sector.equalsIgnoreCase("Unspecified")) {
            missing.add("Locality / Sector Name (Must not be null)");
        }

        double rentVal = 0.0;
        if (rentObj != null) {
            try {
                rentVal = Double.parseDouble(rentObj.toString().replaceAll("[^0-9.]", ""));
            } catch (Exception ignored) {}
        }
        if (rentVal <= 0) {
            missing.add("Monthly Rent Amount (Must be greater than 0)");
        }

        if (bhkCount == null || bhkCount.isBlank() || bhkCount.equalsIgnoreCase("Not Specified") || bhkCount.equalsIgnoreCase("Unspecified")) {
            missing.add("BHK Layout Count (Must not be null)");
        }

        if (!missing.isEmpty()) {
            throw new IllegalArgumentException("Property Creation Rejected: Missing or invalid required non-null fields: " + String.join(", ", missing));
        }
    }

    private RentalDetails buildRentalDetailsFromDTO(ParsedPropertyDTO dto) {
        validateRequiredFields(
                dto.getOwnerPhone(),
                dto.getSector(),
                dto.getRentAmount() != null ? dto.getRentAmount() : dto.getRentVal(),
                dto.getBhk()
        );

        RentalDetails listing = new RentalDetails();
        listing.setTitle(dto.getTitle() != null && !dto.getTitle().isBlank() ? dto.getTitle() : (dto.getBhk() + " Flat in " + dto.getSector()));
        listing.setDescription(dto.getDescription() != null && !dto.getDescription().isBlank() ? dto.getDescription() : (dto.getBhk() + " Flat located in " + dto.getSector() + ", " + (dto.getCity() != null ? dto.getCity() : "Indore")));
        listing.setSector(dto.getSector());
        listing.setAddress(dto.getAddress() != null && !dto.getAddress().isBlank() ? dto.getAddress() : (dto.getSector() + ", " + (dto.getCity() != null ? dto.getCity() : "Indore")));
        listing.setCity(dto.getCity() != null && !dto.getCity().isBlank() ? dto.getCity() : "Indore");
        listing.setBhkCount(dto.getBhk());
        listing.setFurnishingStatus(dto.getFurnishingStatus() != null && !dto.getFurnishingStatus().isBlank() ? dto.getFurnishingStatus() : "Semi-Furnished");
        listing.setVastuFacing(dto.getVastuFacing() != null && !dto.getVastuFacing().isBlank() ? dto.getVastuFacing() : "East Facing");
        if (dto.getAmenities() != null && !dto.getAmenities().isEmpty()) {
            listing.setAmenities(String.join(", ", dto.getAmenities()));
        }
        listing.setMonthlyRent(BigDecimal.valueOf(dto.getRentAmount()));
        listing.setSecurityDeposit(BigDecimal.valueOf(dto.getRentAmount() * 2));
        listing.setOwnerPhoneNumber(dto.getOwnerPhone().trim());
        listing.setLatitude(22.7533);
        listing.setLongitude(75.8937);
        listing.setStatus(ListingStatus.ACTIVE);
        listing.setPropertyType(dto.getType() != null && dto.getType().equalsIgnoreCase("House") ? PropertyType.HOUSE : PropertyType.FLAT);
        return listing;
    }

    private RoomTag parseRoomTag(String roomTagStr) {
        try {
            return RoomTag.valueOf(roomTagStr.toUpperCase());
        } catch (Exception e) {
            return RoomTag.GENERAL;
        }
    }

    private MediaType parseMediaType(String mediaTypeStr) {
        try {
            return MediaType.valueOf(mediaTypeStr.toUpperCase());
        } catch (Exception e) {
            return MediaType.IMAGE;
        }
    }

    private String uploadMediaToCloudinary(MultipartFile file, MediaType mediaType) {
        return (mediaType == MediaType.VIDEO_WALKTHROUGH)
                ? cloudinaryService.uploadVideo(file)
                : cloudinaryService.uploadImage(file);
    }

    private PropertyMediaAsset saveMediaAsset(
            Long id, String cdnUrl, MediaType mediaType, RoomTag roomTag,
            String caption, Boolean isPrimaryCover, String sector,
            String priceTag, String vastuFacing, Listing listing) {

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

        return mediaAssetRepository.save(asset);
    }

    private void updateListingGallery(Listing listing, String cdnUrl) {
        if (listing == null) return;
        String existing = listing.getMediaGalleryUrls();
        String updated = (existing == null || existing.isBlank()) ? cdnUrl : existing + "," + cdnUrl;
        listing.setMediaGalleryUrls(updated);
        listingRepository.save(listing);
    }

    private List<String> processPhotoUploads(Long id, MultipartFile[] files, Listing listing) {
        List<String> uploadedUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            String cdnUrl = cloudinaryService.uploadImage(file);
            uploadedUrls.add(cdnUrl);

            PropertyMediaAsset asset = new PropertyMediaAsset(id, cdnUrl, MediaType.IMAGE, RoomTag.LIVING_ROOM, "Property Photo");
            asset.setSector(listing.getSector());
            asset.setPriceTag("₹22,000 / mo");
            mediaAssetRepository.save(asset);
        }
        return uploadedUrls;
    }

    private void updateListingGalleryList(Listing listing, List<String> uploadedUrls) {
        String existing = listing.getMediaGalleryUrls();
        String updatedGallery = (existing == null || existing.isBlank())
                ? String.join(",", uploadedUrls)
                : existing + "," + String.join(",", uploadedUrls);

        listing.setMediaGalleryUrls(updatedGallery);
        listingRepository.save(listing);
    }

    private RentalDetails buildRentalDetailsFromDTO(ParsedPropertyDTO dto) {
        RentalDetails listing = new RentalDetails();
        listing.setTitle(dto.getTitle() != null ? dto.getTitle() : "Property Listing");
        listing.setDescription(dto.getDescription());
        listing.setSector(dto.getSector() != null ? dto.getSector() : "Vijay Nagar");
        listing.setAddress(dto.getAddress() != null ? dto.getAddress() : dto.getSector());
        listing.setCity(dto.getCity() != null ? dto.getCity() : "Indore");
        listing.setBhkCount(dto.getBhk() != null ? dto.getBhk() : "2 BHK");
        listing.setFurnishingStatus(dto.getFurnishingStatus() != null ? dto.getFurnishingStatus() : "Semi-Furnished");
        listing.setVastuFacing(dto.getVastuFacing() != null ? dto.getVastuFacing() : "North-East Facing");
        if (dto.getAmenities() != null && !dto.getAmenities().isEmpty()) {
            listing.setAmenities(String.join(", ", dto.getAmenities()));
        }
        listing.setMonthlyRent(BigDecimal.valueOf(dto.getRentAmount() != null ? dto.getRentAmount() : 18000.0));
        listing.setSecurityDeposit(BigDecimal.valueOf((dto.getRentAmount() != null ? dto.getRentAmount() : 18000.0) * 2));
        listing.setOwnerPhoneNumber(dto.getOwnerPhone() != null ? dto.getOwnerPhone() : "+91 98765 43210");
        listing.setLatitude(22.7533);
        listing.setLongitude(75.8937);
        listing.setStatus(ListingStatus.ACTIVE);
        listing.setPropertyType(PropertyType.FLAT);
        return listing;
    }
}

