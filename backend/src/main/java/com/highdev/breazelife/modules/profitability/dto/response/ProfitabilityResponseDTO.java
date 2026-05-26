package com.highdev.breazelife.modules.profitability.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProfitabilityResponseDTO(
    String id,
    BigDecimal profit,
    LocalDate date,
    String accountType
) {}