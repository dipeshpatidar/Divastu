package com.indore.divyavastu.spaces.controller;

import com.indore.divyavastu.spaces.entity.Listing;
import com.indore.divyavastu.spaces.entity.ListingStatus;
import com.indore.divyavastu.spaces.entity.RentalDetails;
import com.indore.divyavastu.spaces.repository.ListingRepository;
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
    private final CloudinaryService cloudinaryService;

    public PropertyController(ListingRepository listingRepository, CloudinaryService cloudinaryService) {
        this.listingRepository = listingRepository;
        this.cloudinaryService = cloudinaryService;
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
}
