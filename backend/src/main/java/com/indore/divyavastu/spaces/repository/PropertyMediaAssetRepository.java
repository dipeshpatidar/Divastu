package com.indore.divyavastu.spaces.repository;

import com.indore.divyavastu.spaces.entity.PropertyMediaAsset;
import com.indore.divyavastu.spaces.entity.RoomTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyMediaAssetRepository extends JpaRepository<PropertyMediaAsset, Long> {
    List<PropertyMediaAsset> findByListingIdOrderByUploadedAtDesc(Long listingId);
    List<PropertyMediaAsset> findByListingIdAndRoomTag(Long listingId, RoomTag roomTag);
}
