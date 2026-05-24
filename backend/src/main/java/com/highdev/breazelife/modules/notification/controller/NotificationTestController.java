package com.highdev.breazelife.modules.notification.controller;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.highdev.breazelife.modules.notification.events.QuoteStatusChangedEvent;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/test/notifications")
public class NotificationTestController {

    private final ApplicationEventPublisher eventPublisher;

    public NotificationTestController(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    @PostMapping("/fire")
    public ResponseEntity<ApiResponse<Void>> fireTestEvent(@AuthenticationPrincipal User user) {
        eventPublisher.publishEvent(new QuoteStatusChangedEvent(
                user.getId(),
                user.getId(),
                "QUO-TEST-001",
                QuoteStatusChangedEvent.Status.APPROVED
        ));
        return ResponseEntity.ok(ApiResponse.of("Test notification event fired", 200, "OK"));
    }
}
