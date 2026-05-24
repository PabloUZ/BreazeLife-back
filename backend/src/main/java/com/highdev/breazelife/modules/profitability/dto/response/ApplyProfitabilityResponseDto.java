package com.highdev.breazelife.modules.profitability.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ApplyProfitabilityResponseDto(

        @JsonProperty("applied_at")
        LocalDate appliedAt,

        @JsonProperty("accounts_processed")
        int accountsProcessed,

        @JsonProperty("total_profit_added")
        BigDecimal totalProfitAdded,

        @JsonProperty("details")
        List<AccountProfitDetailDto> details

) {
    public record AccountProfitDetailDto(

            @JsonProperty("account_id")
            String accountId,

            @JsonProperty("account_type")
            String accountType,

            @JsonProperty("monthly_rate")
            BigDecimal monthlyRate,

            @JsonProperty("previous_balance")
            BigDecimal previousBalance,

            @JsonProperty("profit")
            BigDecimal profit,

            @JsonProperty("new_balance")
            BigDecimal newBalance

    ) {}
}

