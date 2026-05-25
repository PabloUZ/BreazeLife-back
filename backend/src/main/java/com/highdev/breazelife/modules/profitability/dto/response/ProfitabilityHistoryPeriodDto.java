package com.highdev.breazelife.modules.profitability.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProfitabilityHistoryPeriodDto(

        @JsonProperty("period")
        String period,

        @JsonProperty("applied_at")
        LocalDate appliedAt,

        @JsonProperty("accounts_processed")
        long accountsProcessed,

        @JsonProperty("total_profit")
        BigDecimal totalProfit

) {}

