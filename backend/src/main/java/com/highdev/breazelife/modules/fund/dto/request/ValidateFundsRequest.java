package com.highdev.breazelife.modules.fund.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ValidateFundsRequest(

    @NotNull(message = "required_payroll is required")
    @DecimalMin(value = "0.0", message = "required_payroll must be >= 0")
    BigDecimal requiredPayroll,

    @NotNull(message = "required_pension is required")
    @DecimalMin(value = "0.0", message = "required_pension must be >= 0")
    BigDecimal requiredPension
) {}