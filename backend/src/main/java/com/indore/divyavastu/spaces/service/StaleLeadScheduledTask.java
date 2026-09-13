package com.indore.divyavastu.spaces.service;

import com.indore.divyavastu.spaces.entity.LeadRoutingQueue;
import com.indore.divyavastu.spaces.entity.LeadStatus;
import com.indore.divyavastu.spaces.repository.LeadRoutingQueueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class StaleLeadScheduledTask {

    private static final Logger logger = LoggerFactory.getLogger(StaleLeadScheduledTask.class);
    private final LeadRoutingQueueRepository leadRoutingQueueRepository;

    public StaleLeadScheduledTask(LeadRoutingQueueRepository leadRoutingQueueRepository) {
        this.leadRoutingQueueRepository = leadRoutingQueueRepository;
    }

    /**
     * Spring Cron Job running every 5 minutes to detect leads un-contacted for > 30 minutes
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void checkForStaleLeads() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        List<LeadRoutingQueue> assignedLeads = leadRoutingQueueRepository.findAll().stream()
                .filter(l -> l.getStatus() == LeadStatus.ASSIGNED && l.getCreatedAt().isBefore(threshold))
                .toList();

        for (LeadRoutingQueue lead : assignedLeads) {
            lead.setStatus(LeadStatus.STALE);
            leadRoutingQueueRepository.save(lead);
            logger.warn("Lead ID {} for tenant {} marked as STALE due to >30m inactivity by assigned ground boy.",
                    lead.getId(), lead.getTenantName());
            // Ping Admin Dashboard notification channel
        }
    }
}
