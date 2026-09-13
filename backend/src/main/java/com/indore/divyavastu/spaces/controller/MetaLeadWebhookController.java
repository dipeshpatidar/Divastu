package com.indore.divyavastu.spaces.controller;

import com.indore.divyavastu.spaces.service.MetaLeadIngestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhooks/meta-leads")
public class MetaLeadWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(MetaLeadWebhookController.class);

    @Value("${meta.webhook.verify-token:DIVYAVASTU_META_VERIFY_TOKEN_2026}")
    private String metaVerifyToken;

    private final MetaLeadIngestionService metaLeadIngestionService;

    public MetaLeadWebhookController(MetaLeadIngestionService metaLeadIngestionService) {
        this.metaLeadIngestionService = metaLeadIngestionService;
    }

    /**
     * Meta Webhook Subscription Verification Endpoint
     */
    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {

        if ("subscribe".equals(mode) && metaVerifyToken.equals(token)) {
            logger.info("Meta Webhook successfully verified with challenge token.");
            return ResponseEntity.ok(challenge);
        } else {
            logger.warn("Meta Webhook verification failed. Invalid verify token provided: {}", token);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification failed");
        }
    }

    /**
     * Real-time Meta Lead Ingestion Endpoint (Triggers Asynchronous Processing)
     */
    @PostMapping
    public ResponseEntity<String> handleIncomingMetaLead(@RequestBody Map<String, Object> payload) {
        logger.info("Received Meta Lead Webhook event payload: {}", payload);

        try {
            if (payload.containsKey("entry")) {
                List<?> entries = (List<?>) payload.get("entry");
                for (Object entryObj : entries) {
                    if (entryObj instanceof Map<?, ?> entryMap && entryMap.containsKey("changes")) {
                        List<?> changes = (List<?>) entryMap.get("changes");
                        for (Object changeObj : changes) {
                            if (changeObj instanceof Map<?, ?> changeMap && changeMap.containsKey("value")) {
                                Map<?, ?> valueMap = (Map<?, ?>) changeMap.get("value");
                                if (valueMap.containsKey("leadgen_id")) {
                                    String leadId = valueMap.get("leadgen_id").toString();
                                    // Trigger non-blocking async parsing service
                                    metaLeadIngestionService.processMetaLeadAsync(leadId);
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error extracting leadgen_id from Meta webhook payload", e);
        }

        // Return 200 OK immediately to satisfy Meta Graph API webhook SLA
        return ResponseEntity.ok("EVENT_RECEIVED");
    }
}
