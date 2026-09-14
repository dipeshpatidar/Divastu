package com.indore.divyavastu.spaces.repository;

import com.indore.divyavastu.spaces.entity.Listing;
import com.indore.divyavastu.spaces.entity.ListingStatus;
import com.indore.divyavastu.spaces.entity.ListingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByStatus(ListingStatus status);
    List<Listing> findBySectorIgnoreCase(String sector);
    List<Listing> findBySectorIgnoreCaseAndStatus(String sector, ListingStatus status);
    List<Listing> findByListingTypeAndStatus(ListingType listingType, ListingStatus status);
    List<Listing> findByBhkCountAndStatus(String bhkCount, ListingStatus status);
}
