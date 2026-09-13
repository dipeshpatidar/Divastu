package com.indore.divyavastu.spaces.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Uploads photo file to Cloudinary under divyavastu/properties/images
     */
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return "/assets/hero_luxury.jpg";
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "divyavastu/properties/images",
                            "resource_type", "image",
                            "format", "webp",
                            "quality", "auto"
                    )
            );
            String url = (String) uploadResult.get("secure_url");
            logger.info("Successfully uploaded property photo to Cloudinary: {}", url);
            return url;
        } catch (Exception e) {
            logger.warn("Cloudinary photo upload fallback active: {}", e.getMessage());
            return "/assets/hero_luxury.jpg";
        }
    }

    /**
     * Uploads video walkthrough MP4 file to Cloudinary under divyavastu/properties/videos
     */
    public String uploadVideo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return "/assets/videos/property_walkthrough_1.mp4";
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "divyavastu/properties/videos",
                            "resource_type", "video",
                            "quality", "auto"
                    )
            );
            String url = (String) uploadResult.get("secure_url");
            logger.info("Successfully uploaded property video walkthrough to Cloudinary: {}", url);
            return url;
        } catch (Exception e) {
            logger.warn("Cloudinary video upload fallback active: {}", e.getMessage());
            return "/assets/videos/property_walkthrough_1.mp4";
        }
    }
}
