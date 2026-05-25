package com.highdev.breazelife.modules.notification.controller;

import com.highdev.breazelife.modules.notification.dto.response.AdminNotificationResponseDto;
import com.highdev.breazelife.modules.notification.service.NotificationService;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Notifications", description = "Notification management endpoints for administrators")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(summary = "Consultar notificaciones del administrador", description = "Retorna las notificaciones del administrador autenticado ordenadas por fecha de creacion descendente")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notificaciones obtenidas exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminNotificationResponseDto>>> getNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Boolean read
    ) {
        NotificationService.AdminNotificationsPage result =
                notificationService.getAdminNotifications(user.getId(), page, limit, read);
        return ResponseEntity.ok(ApiResponse.of(
                "Notifications retrieved successfully", 200, "OK",
                result.items(), result.pagination()
        ));
    }

    @Operation(summary = "Marcar notificacion como leida", description = "Marca como leida una notificacion que pertenece al administrador autenticado")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notificacion actualizada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notificacion no encontrada")
    })
    @PatchMapping("/{notification_id}/read")
    public ResponseEntity<ApiResponse<AdminNotificationResponseDto>> markAsRead(
            @AuthenticationPrincipal User user,
            @PathVariable("notification_id") String notificationId
    ) {
        AdminNotificationResponseDto data = notificationService.markAdminNotificationAsRead(user.getId(), notificationId);
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
