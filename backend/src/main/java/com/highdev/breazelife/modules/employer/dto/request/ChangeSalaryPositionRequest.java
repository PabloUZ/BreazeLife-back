package com.highdev.breazelife.modules.employer.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class ChangeSalaryPositionRequest {
    @NotBlank
    @Size(max = 50)
    private String position;

    @NotNull
    @Positive
    private BigDecimal baseSalary;

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }
}
