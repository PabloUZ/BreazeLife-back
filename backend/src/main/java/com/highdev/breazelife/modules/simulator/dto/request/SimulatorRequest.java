package com.highdev.breazelife.modules.simulator.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * BLIFE-16 — Request del simulador de pensión.
 *
 * currentAge:            edad actual del afiliado
 * retirementAge:         edad a la que quiere pensionarse (mín 57 mujeres / 62 hombres en Colombia)
 * expectedMonthlySalary: salario mensual esperado durante el período de cotización
 * accountType:           tipo de fondo (CONSERVATIVE, MODERATE, RISKY)
 * currentBalance:        saldo actual acumulado en la cuenta pensional
 * currentQuotedDays:     días cotizados acumulados hasta hoy
 */
public record SimulatorRequest(

    @NotNull(message = "Current age is required")
    @Min(value = 18, message = "Minimum age is 18")
    @Max(value = 80, message = "Maximum age is 80")
    Integer currentAge,

    @NotNull(message = "Retirement age is required")
    @Min(value = 57, message = "Minimum retirement age is 57")
    @Max(value = 80, message = "Maximum retirement age is 80")
    Integer retirementAge,

    @NotNull(message = "Expected monthly salary is required")
    @Positive(message = "Salary must be positive")
    Double expectedMonthlySalary,

    @NotNull(message = "Account type is required")
    String accountType,

    @NotNull(message = "Current balance is required")
    Double currentBalance,

    @NotNull(message = "Current quoted days is required")
    Integer currentQuotedDays
) {}