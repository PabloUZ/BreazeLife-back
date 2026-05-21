package com.highdev.breazelife.modules.notification.events;

import java.math.BigDecimal;

public record ProfitabilityAppliedEvent(
        String affiliateId,
        BigDecimal amount
) {}
