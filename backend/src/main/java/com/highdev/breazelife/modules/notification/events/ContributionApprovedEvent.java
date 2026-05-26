package com.highdev.breazelife.modules.notification.events;

import java.math.BigDecimal;

public record ContributionApprovedEvent(
        String affiliateId,
        String quoteId,
        String accountId,
        BigDecimal accumulatedAmount,
        BigDecimal newBalance
) {}
