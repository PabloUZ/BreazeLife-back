package com.highdev.breazelife.modules.payment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ExecutePayrollRequest {

    @NotBlank
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Period must be in format YYYY-MM (e.g. 2026-05)")
    private String period;

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
}
