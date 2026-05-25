package com.highdev.breazelife.modules.config.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record SystemConfigResponseDto(

        @JsonProperty("rate_conservative")
        BigDecimal rateConservative,

        @JsonProperty("rate_moderate")
        BigDecimal rateModerate,

        @JsonProperty("rate_risky")
        BigDecimal rateRisky,

        @JsonProperty("life_expectancy")
        Integer lifeExpectancy,

        @JsonProperty("contribution_rate")
        BigDecimal contributionRate

) {}

