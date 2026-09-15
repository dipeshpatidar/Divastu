package com.indore.pathome.spaces.controller;

import com.indore.pathome.spaces.entity.SystemNotification;
import com.indore.pathome.spaces.entity.TargetRole;
import com.indore.pathome.spaces.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Retrieves notifications strictly scoped for the requesting user's role
     */
    @GetMapping
    public ResponseEntity<List<SystemNotification>> getNotifications(
            @RequestParam(value = "role", required = false, defaultValue = "ALL") String roleStr,
            @RequestParam(value = "recipientUserId", required = false) String recipientUserId
    ) {
        TargetRole role;
        try {
            role = TargetRole.valueOf(roleStr.toUpperCase());
        } catch (Exception e) {
            role = TargetRole.ALL;
        }

        List<SystemNotification> list = notificationService.getNotificationsForRole(role, recipientUserId);
        return ResponseEntity.ok(list);
    }

    /**
     * Admin/System Endpoint to Dispatch a Role-Scoped Notification
     */
    @PostMapping
    public ResponseEntity<SystemNotification> createNotification(@RequestBody Map<String, Object> payload) {
        String roleStr = (String) payload.getOrDefault("targetRole", "ALL");
        TargetRole targetRole;
        try {
            targetRole = TargetRole.valueOf(roleStr.toUpperCase());
        } catch (Exception e) {
            targetRole = TargetRole.ALL;
        }

        String recipientUserId = (String) payload.get("recipientUserId");
        String title = (String) payload.getOrDefault("title", "System Notification");
        String message = (String) payload.getOrDefault("message", "");
        String details = (String) payload.get("details");
        String category = (String) payload.getOrDefault("category", "SYSTEM");
        String type = (String) payload.getOrDefault("type", "info");

        SystemNotification created = notificationService.createNotification(targetRole, recipientUserId, title, message, details, category, type);
        return ResponseEntity.ok(created);
    }

    /**
     * Marks a specific notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable("id") Long id) {
        boolean success = notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("success", success, "id", id));
    }
}
