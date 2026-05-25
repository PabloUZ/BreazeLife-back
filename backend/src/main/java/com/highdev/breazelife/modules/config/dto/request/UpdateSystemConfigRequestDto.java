package com.highdev.breazelife.modules.config.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record UpdateSystemConfigRequestDto(

        @NotNull(message = "rate_conservative is required")
        @DecimalMin(value = "0.001", message = "Minimum rate is 0.1%")
        @DecimalMax(value = "0.05",  message = "Maximum rate is 5%")
        @JsonProperty("rate_conservative")
        BigDecimal rateConservative,

        @NotNull(message = "rate_moderate is required")
        @DecimalMin(value = "0.001", message = "Minimum rate is 0.1%")
        @DecimalMax(value = "0.05",  message = "Maximum rate is 5%")
        @JsonProperty("rate_moderate")
        BigDecimal rateModerate,

        @NotNull(message = "rate_risky is required")
        @DecimalMin(value = "0.001", message = "Minimum rate is 0.1%")
        @DecimalMax(value = "0.05",  message = "Maximum rate is 5%")
        @JsonProperty("rate_risky")
        BigDecimal rateRisky,

        @NotNull(message = "life_expectancy is required")
        @Min(value = 50, message = "Minimum life expectancy is 50 years")
        @Max(value = 100, message = "Maximum life expectancy is 100 years")
        @JsonProperty("life_expectancy")
        Integer lifeExpectancy,

        @NotNull(message = "contribution_rate is required")
        @DecimalMin(value = "0.01", message = "Minimum contribution rate is 1%")
        @DecimalMax(value = "0.30", message = "Maximum contribution rate is 30%")
        @JsonProperty("contribution_rate")
        BigDecimal contributionRate

) {}

