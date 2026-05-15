package com.highdev.breazelife.modules.affiliate.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AffiliateDashboardResponseDTO(
        String accountId,
        BigDecimal balance,
        String accountType,
        Integer quotedDays,
        Integer quotedWeeks,
        LastContribution lastContribution,
        LastProfitability lastProfitability
) {
    public record LastContribution(
            BigDecimal amount,
            LocalDateTime date,
            String status
    ) {}

    public record LastProfitability(
            BigDecimal profit,
            LocalDate date
    ) {}
}
