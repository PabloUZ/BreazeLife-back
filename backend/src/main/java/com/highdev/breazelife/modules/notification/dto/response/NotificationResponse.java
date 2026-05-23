package com.highdev.breazelife.modules.notification.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.highdev.breazelife.modules.notification.entity.Notification;

public record NotificationResponse(

        @JsonProperty("notification_id")
        String notificationId,

        @JsonProperty("message")
        String message,

        @JsonProperty("read")
        Boolean read

) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getMessage(),
                notification.getRead()
        );
    }
}
