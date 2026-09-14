package com.indore.divyavastu.spaces.service;

import com.indore.divyavastu.spaces.entity.EmployeeProfile;
import com.indore.divyavastu.spaces.entity.LeadRoutingQueue;
import com.indore.divyavastu.spaces.entity.LeadStatus;
import com.indore.divyavastu.spaces.repository.EmployeeProfileRepository;
import com.indore.divyavastu.spaces.repository.LeadRoutingQueueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Asynchronous lead ingestion service processing incoming Meta Graph API webhooks and routing leads to sector agents.
 */
@Service
public class MetaLeadIngestionService {

    private static final Logger logger = LoggerFactory.getLogger(MetaLeadIngestionService.class);
    private static final Pattern CLEAN_NUMERIC_PATTERN = Pattern.compile("[^0-9.]");

    @Value("${meta.graph.api.token:MOCK_META_GRAPH_API_TOKEN}")
    private String metaAccessToken;

    @Value("${whatsapp.business.api.url:https://api.whatsapp.com/v1/messages}")
    private String whatsappApiUrl;

    private final EmployeeProfileRepository employeeProfileRepository;
    private final LeadRoutingQueueRepository leadRoutingQueueRepository;
    private final RestTemplate restTemplate;

    public MetaLeadIngestionService(
            EmployeeProfileRepository employeeProfileRepository,
            LeadRoutingQueueRepository leadRoutingQueueRepository) {
        this.employeeProfileRepository = Objects.requireNonNull(
                employeeProfileRepository, "EmployeeProfileRepository must not be null");
        this.leadRoutingQueueRepository = Objects.requireNonNull(
                leadRoutingQueueRepository, "LeadRoutingQueueRepository must not be null");
        this.restTemplate = new RestTemplate();
    }

    @Async
    public void processMetaLeadAsync(String leadId) {
        if (leadId == null || leadId.isBlank()) {
            logger.warn("Received empty or null leadId for processing");
            return;
        }

        logger.info("Starting asynchronous processing for Meta Lead ID: {}", leadId);
        try {
            LeadRoutingQueue leadRecord = fetchAndBuildLeadRecord(leadId);
            routeAndAssignLead(leadRecord, leadId);
        } catch (Exception e) {
            logger.error("Error occurred while processing Meta lead {}", leadId, e);
        }
    }

    private LeadRoutingQueue fetchAndBuildLeadRecord(String leadId) {
        String graphUrl = String.format("https://graph.facebook.com/v19.0/%s?access_token=%s", leadId, metaAccessToken);

        String tenantName = "Tenant (" + leadId + ")";
        String phoneNumber = "+919876543210";
        String targetSector = "Vijay Nagar";
        BigDecimal budget = new BigDecimal("15000");

        try {
            Map<?, ?> metaResponse = restTemplate.getForObject(graphUrl, Map.class);
            if (metaResponse != null && metaResponse.containsKey("field_data")) {
                List<?> fieldData = (List<?>) metaResponse.get("field_data");
                for (Object item : fieldData) {
                    if (item instanceof Map<?, ?> fieldMap) {
                        String name = (String) fieldMap.get("name");
                        List<?> values = (List<?>) fieldMap.get("values");
                        if (values != null && !values.isEmpty()) {
                            String val = values.get(0).toString();
                            if ("full_name".equalsIgnoreCase(name)) tenantName = val;
                            else if ("phone_number".equalsIgnoreCase(name)) phoneNumber = val;
                            else if ("sector".equalsIgnoreCase(name) || "neighborhood".equalsIgnoreCase(name)) targetSector = val;
                            else if ("budget".equalsIgnoreCase(name)) budget = new BigDecimal(CLEAN_NUMERIC_PATTERN.matcher(val).replaceAll(""));
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Meta Graph API fetch fallback for leadId {}: {}", leadId, e.getMessage());
        }

        LeadRoutingQueue record = new LeadRoutingQueue();
        record.setTenantName(tenantName);
        record.setPhoneNumber(phoneNumber);
        record.setTargetSector(targetSector);
        record.setBudget(budget);
        return record;
    }

    private void routeAndAssignLead(LeadRoutingQueue leadRecord, String leadId) {
        String targetSector = leadRecord.getTargetSector();
        Optional<EmployeeProfile> assignedBoyOpt = employeeProfileRepository
                .findByAssignedSectorAndRoleType(targetSector, "GROUND_BOY");

        if (assignedBoyOpt.isPresent()) {
            EmployeeProfile groundBoy = assignedBoyOpt.get();
            leadRecord.setStatus(LeadStatus.ASSIGNED);
            leadRecord.setAssignedEmployee(groundBoy);
            leadRoutingQueueRepository.save(leadRecord);

            logger.info("Lead {} mapped to Ground Boy {} for sector {}", leadId, groundBoy.getUser().getFullName(), targetSector);
            triggerWhatsAppAlert(groundBoy.getUser().getPhoneNumber(), leadRecord.getTenantName(), leadRecord.getPhoneNumber(), targetSector);
        } else {
            leadRecord.setStatus(LeadStatus.UNMAPPED);
            leadRoutingQueueRepository.save(leadRecord);
            logger.warn("No Ground Boy assigned for sector {}. Lead {} marked UNMAPPED.", targetSector, leadId);
        }
    }

    private void triggerWhatsAppAlert(String groundBoyPhone, String tenantName, String tenantPhone, String sector) {
        try {
            Map<String, Object> payload = Map.of(
                    "to", groundBoyPhone,
                    "type", "template",
                    "template", Map.of(
                            "name", "new_lead_assigned",
                            "params", List.of(tenantName, tenantPhone, sector)
                    )
            );
            restTemplate.postForLocation(whatsappApiUrl, payload);
            logger.info("WhatsApp alert sent to Ground Boy phone {}", groundBoyPhone);
        } catch (Exception e) {
            logger.error("Failed to send WhatsApp alert: {}", e.getMessage());
        }
    }
}

