package com.highdev.breazelife.modules.fund.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public record DeductFundsRequest(

    @NotNull(message = "payroll_amount is required")
    @DecimalMin(value = "1.0", message = "payroll_amount must be greater than 0")
    BigDecimal payrollAmount,

    @NotNull(message = "pension_amount is required")
    @DecimalMin(value = "1.0", message = "pension_amount must be greater than 0")
    BigDecimal pensionAmount,

    @NotBlank(message = "payroll_period is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "payroll_period must be in format YYYY-MM")
    String payrollPeriod
) {}