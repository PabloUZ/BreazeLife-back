package com.highdev.breazelife.modules.notification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.highdev.breazelife.modules.notification.service.NotificationService;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/test/notifications")
public class NotificationTestController {

    private final NotificationService notificationService;

    public NotificationTestController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/fire")
    public ResponseEntity<ApiResponse<Void>> fireTestEvent(@AuthenticationPrincipal User user) {
        // Crea exactamente una notificación para el usuario autenticado.
        // (El evento QuoteStatusChangedEvent notifica a affiliate Y employer;
        // usar el mismo ID para ambos creaba dos notificaciones al mismo usuario.)
        notificationService.createNotification(
                user.getId(),
                "🧪 Test: tu solicitud QUO-TEST-001 ha sido aprobada"
        );
        return ResponseEntity.ok(ApiResponse.of("Test notification fired", 200, "OK"));
    }
}
