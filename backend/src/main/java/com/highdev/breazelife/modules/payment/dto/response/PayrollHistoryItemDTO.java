package com.highdev.breazelife.modules.payment.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PayrollHistoryItemDTO {

    @JsonProperty("payroll_id")
    private String payrollId;

    private String period;

    @JsonProperty("total_employees")
    private long totalEmployees;

    @JsonProperty("total_net_salary")
    private BigDecimal totalNetSalary;

    @JsonProperty("total_pension_contrib")
    private BigDecimal totalPensionContrib;

    @JsonProperty("total_debit")
    private BigDecimal totalDebit;

    private String status;

    @JsonProperty("executed_at")
    private LocalDateTime executedAt;

    public String getPayrollId() { return payrollId; }
    public void setPayrollId(String payrollId) { this.payrollId = payrollId; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public BigDecimal getTotalNetSalary() { return totalNetSalary; }
    public void setTotalNetSalary(BigDecimal totalNetSalary) { this.totalNetSalary = totalNetSalary; }

    public BigDecimal getTotalPensionContrib() { return totalPensionContrib; }
    public void setTotalPensionContrib(BigDecimal totalPensionContrib) { this.totalPensionContrib = totalPensionContrib; }

    public BigDecimal getTotalDebit() { return totalDebit; }
    public void setTotalDebit(BigDecimal totalDebit) { this.totalDebit = totalDebit; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }
}
