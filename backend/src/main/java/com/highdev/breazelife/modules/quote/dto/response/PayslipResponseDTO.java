package com.highdev.breazelife.modules.quote.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PayslipResponseDTO {
    // Datos del empleado
    private String affiliateName;
    private String affiliateDocument;
    
    // Periodo
    private String period;
    
    // Cálculos salariales
    private BigDecimal grossSalary;       // Salario bruto (IBC completo)
    private BigDecimal pensionDeduction;  // Deducción pensional (4%)
    private BigDecimal netSalaryReceived; // Salario neto recibido
    
    // Aportes
    private BigDecimal employerContrib;   // Aporte empleador (12%)
    private BigDecimal totalContrib;      // Total cotización (16%)
    
    // Estado
    private String status;                // Estado (Pagado / Pendiente)
}