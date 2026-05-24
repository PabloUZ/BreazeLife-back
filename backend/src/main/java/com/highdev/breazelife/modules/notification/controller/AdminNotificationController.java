package com.highdev.breazelife.modules.notification.controller;

import com.highdev.breazelife.modules.notification.dto.response.MarkReadResponse;
import com.highdev.breazelife.modules.notification.dto.response.NotificationResponse;
import com.highdev.breazelife.modules.notification.service.NotificationService;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.shared.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Boolean read
    ) {
        NotificationService.NotificationsPage result =
                notificationService.getNotifications(user.getId(), page, limit, read);
        return ResponseEntity.ok(ApiResponse.of(
                "Notifications retrieved successfully", 200, "OK",
                result.items(), result.pagination()
        ));
    }

    @PatchMapping("/{notification_id}/read")
    public ResponseEntity<ApiResponse<MarkReadResponse>> markAsRead(
            @AuthenticationPrincipal User user,
            @PathVariable("notification_id") String notificationId
    ) {
        MarkReadResponse data = notificationService.markAsRead(user.getId(), notificationId);
        return ResponseEntity.ok(ApiResponse.of(
                "Notification marked as read successfully", 200, "OK", data
        ));
    }

    @DeleteMapping("/{notification_id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @AuthenticationPrincipal User user,
            @PathVariable("notification_id") String notificationId
    ) {
        notificationService.deleteNotification(user.getId(), notificationId);
        return ResponseEntity.ok(ApiResponse.of("Notification deleted successfully", 200, "OK"));
    }
}
