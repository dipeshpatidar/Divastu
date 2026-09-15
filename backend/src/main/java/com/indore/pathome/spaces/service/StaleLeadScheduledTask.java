package com.indore.pathome.spaces.service;

import com.indore.pathome.spaces.entity.LeadRoutingQueue;
import com.indore.pathome.spaces.entity.LeadStatus;
import com.indore.pathome.spaces.repository.LeadRoutingQueueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * Scheduled background worker engineered for O(1) detection of stale un-contacted leads.
 */
@Component
public class StaleLeadScheduledTask {

    private static final Logger logger = LoggerFactory.getLogger(StaleLeadScheduledTask.class);
    private static final int STALE_THRESHOLD_MINUTES = 30;

    private final LeadRoutingQueueRepository leadRoutingQueueRepository;

    public StaleLeadScheduledTask(LeadRoutingQueueRepository leadRoutingQueueRepository) {
        this.leadRoutingQueueRepository = Objects.requireNonNull(
                leadRoutingQueueRepository, "LeadRoutingQueueRepository must not be null");
    }

    /**
     * Scheduled job executing every 5 minutes to mark un-contacted leads as STALE.
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void checkForStaleLeads() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(STALE_THRESHOLD_MINUTES);
        List<LeadRoutingQueue> staleLeads = leadRoutingQueueRepository
                .findByStatusAndCreatedAtBefore(LeadStatus.ASSIGNED, threshold);

        staleLeads.forEach(this::markLeadAsStale);
    }

    private void markLeadAsStale(LeadRoutingQueue lead) {
        if (lead == null) {
            return;
        }
        lead.setStatus(LeadStatus.STALE);
        leadRoutingQueueRepository.save(lead);
        logger.warn("Lead ID {} for tenant {} marked as STALE due to >{}m inactivity by assigned ground boy.",
                lead.getId(), lead.getTenantName(), STALE_THRESHOLD_MINUTES);
    }
}

