package com.highdev.breazelife.modules.affiliate.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ProgressResponseDTO {
    private BigDecimal accumulatedWeeks;
    private BigDecimal missingWeeks;
    private BigDecimal progressPercentage;
}