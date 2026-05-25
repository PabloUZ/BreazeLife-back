package com.highdev.breazelife.modules.notification.dto.response;

import com.highdev.breazelife.modules.notification.entity.Notification;

import java.time.LocalDateTime;

public class AdminNotificationResponseDto {
    private final String id;
    private final String userId;
    private final String message;
    private final Boolean isRead;
    private final LocalDateTime createdAt;

    public AdminNotificationResponseDto(
            String id,
            String userId,
            String message,
            Boolean isRead,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.userId = userId;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public static AdminNotificationResponseDto from(Notification notification) {
        return new AdminNotificationResponseDto(
                notification.getId(),
                notification.getUser().getId(),
                notification.getMessage(),
                notification.getRead(),
                notification.getCreatedAt()
        );
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getMessage() {
        return message;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
