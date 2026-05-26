package com.highdev.breazelife.modules.notification.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.highdev.breazelife.modules.notification.entity.Notification;

public record MarkReadResponse(

        @JsonProperty("notification_id")
        String notificationId,

        @JsonProperty("read")
        Boolean read

) {
    public static MarkReadResponse from(Notification notification) {
        return new MarkReadResponse(notification.getId(), notification.getRead());
    }
}
