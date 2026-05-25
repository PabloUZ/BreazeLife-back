package com.highdev.breazelife.modules.quote.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BalanceHistoryResponseDTO {
    private LocalDateTime contributionDate;
    private BigDecimal contributionValue; // Suma de aporte empleador + afiliado
    private BigDecimal resultingBalance;   // Salario acumulado histórico resultante
}