package com.indore.divyavastu.spaces.repository;

import com.indore.divyavastu.spaces.entity.LeadRoutingQueue;
import com.indore.divyavastu.spaces.entity.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeadRoutingQueueRepository extends JpaRepository<LeadRoutingQueue, Long> {
    List<LeadStatus> findByStatusAndCreatedAtBefore(LeadStatus status, LocalDateTime threshold);
}
