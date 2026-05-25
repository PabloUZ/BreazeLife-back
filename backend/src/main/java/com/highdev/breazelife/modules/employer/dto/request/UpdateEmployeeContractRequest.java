package com.highdev.breazelife.modules.employer.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class UpdateEmployeeContractRequest {

    @NotNull(message = "El salario base es obligatorio")
    @Min(value = 1, message = "El salario debe ser mayor a cero")
    private BigDecimal baseSalary;

    @NotBlank(message = "El cargo o posición es obligatorio")
    private String position;

    // Getters y Setters
    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
}