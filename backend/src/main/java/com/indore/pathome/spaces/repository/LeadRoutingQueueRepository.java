package com.indore.pathome.spaces.repository;

import com.indore.pathome.spaces.entity.LeadRoutingQueue;
import com.indore.pathome.spaces.entity.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeadRoutingQueueRepository extends JpaRepository<LeadRoutingQueue, Long> {
    List<LeadRoutingQueue> findByStatusAndCreatedAtBefore(LeadStatus status, LocalDateTime threshold);
}
