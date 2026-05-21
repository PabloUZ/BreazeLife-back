package com.highdev.breazelife.modules.notification.events;

public record QuoteStatusChangedEvent(
        String affiliateId,
        String employerId,
        String quoteId,
        Status status
) {
    public enum Status { APPROVED, REJECTED }
}
