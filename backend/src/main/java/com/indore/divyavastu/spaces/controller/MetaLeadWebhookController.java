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
import java.util.Objects;

/**
 * Controller handling real-time Webhook subscriptions and lead payload ingestion from Meta Graph API.
 */
@RestController
@RequestMapping("/api/v1/webhooks/meta-leads")
public class MetaLeadWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(MetaLeadWebhookController.class);

    @Value("${meta.webhook.verify-token:DIVYAVASTU_META_VERIFY_TOKEN_2026}")
    private String metaVerifyToken;

    private final MetaLeadIngestionService metaLeadIngestionService;

    public MetaLeadWebhookController(MetaLeadIngestionService metaLeadIngestionService) {
        this.metaLeadIngestionService = Objects.requireNonNull(
                metaLeadIngestionService, "MetaLeadIngestionService must not be null");
    }

    /**
     * Meta Webhook Subscription Verification Endpoint.
     */
    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {

        if ("subscribe".equals(mode) && metaVerifyToken.equals(token)) {
            logger.info("Meta Webhook successfully verified with challenge token.");
            return ResponseEntity.ok(challenge);
        }

        logger.warn("Meta Webhook verification failed. Invalid verify token provided.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification failed");
    }

    /**
     * Real-time Meta Lead Ingestion Endpoint (Triggers Asynchronous Processing).
     */
    @PostMapping
    public ResponseEntity<String> handleIncomingMetaLead(@RequestBody Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) {
            return ResponseEntity.badRequest().body("Payload cannot be empty");
        }

        logger.info("Received Meta Lead Webhook event payload with keys: {}", payload.keySet());
        processPayloadEntries(payload);

        return ResponseEntity.ok("EVENT_RECEIVED");
    }

    private void processPayloadEntries(Map<String, Object> payload) {
        try {
            if (!payload.containsKey("entry") || !(payload.get("entry") instanceof List<?> entries)) {
                return;
            }
            for (Object entryObj : entries) {
                if (entryObj instanceof Map<?, ?> entryMap) {
                    processEntryMap(entryMap);
                }
            }
        } catch (Exception e) {
            logger.error("Error parsing leadgen_id from Meta webhook payload", e);
        }
    }

    private void processEntryMap(Map<?, ?> entryMap) {
        if (!entryMap.containsKey("changes") || !(entryMap.get("changes") instanceof List<?> changes)) {
            return;
        }
        for (Object changeObj : changes) {
            if (changeObj instanceof Map<?, ?> changeMap && changeMap.get("value") instanceof Map<?, ?> valueMap) {
                if (valueMap.containsKey("leadgen_id")) {
                    String leadId = valueMap.get("leadgen_id").toString();
                    metaLeadIngestionService.processMetaLeadAsync(leadId);
                }
            }
        }
    }
}

