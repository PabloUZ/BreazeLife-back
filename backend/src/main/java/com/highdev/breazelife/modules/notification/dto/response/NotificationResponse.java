package com.highdev.breazelife.modules.notification.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.highdev.breazelife.modules.notification.entity.Notification;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record NotificationResponse(

        @JsonProperty("notification_id")
        String notificationId,

        @JsonProperty("type")
        String type,

        @JsonProperty("quote_id")
        String quoteId,

        @JsonProperty("account_id")
        String accountId,

        @JsonProperty("accumulated_amount")
        BigDecimal accumulatedAmount,

        @JsonProperty("new_balance")
        BigDecimal newBalance,

        @JsonProperty("message")
        String message,

        @JsonProperty("read")
        Boolean read,

        @JsonProperty("created_at")
        LocalDateTime createdAt

) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                null,
                null,
                null,
                null,
                null,
                notification.getMessage(),
                notification.getRead(),
                notification.getCreatedAt()
        );
    }

    public static NotificationResponse contributionApproved(
            Notification notification,
            String quoteId,
            String accountId,
            BigDecimal accumulatedAmount,
            BigDecimal newBalance
    ) {
        return new NotificationResponse(
                notification.getId(),
                "CONTRIBUTION_APPROVED",
                quoteId,
                accountId,
                accumulatedAmount,
                newBalance,
                notification.getMessage(),
                notification.getRead(),
                notification.getCreatedAt()
        );
    }
}
