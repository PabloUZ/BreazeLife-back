package com.highdev.breazelife.modules.affiliate.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AffiliateDashboardResponseDTO(
        String accountId,
        String accountType,
        BigDecimal balance,
        BigDecimal quotedWeeks,
        BigDecimal weeksRemaining,
        BigDecimal progressPercentage,
        MonthlyProfitability monthlyProfitability,
        LastContribution lastContribution
) {
    public record MonthlyProfitability(
            BigDecimal profit,
            LocalDate date
    ) {}

    public record LastContribution(
            String quoteId,
            BigDecimal employerContrib,
            BigDecimal affiliateContrib,
            BigDecimal totalContribution,
            Integer daysContributed,
            LocalDateTime contribDate,
            String status
    ) {}
}
