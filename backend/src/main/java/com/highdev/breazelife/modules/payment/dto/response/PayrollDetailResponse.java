package com.highdev.breazelife.modules.payment.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PayrollDetailResponse {

    @JsonProperty("payroll_id")
    private String payrollId;

    private String period;

    @JsonProperty("employer_id")
    private String employerId;

    @JsonProperty("company_name")
    private String companyName;

    private String status;

    @JsonProperty("executed_at")
    private LocalDateTime executedAt;

    private List<PayrollDetailPaymentDTO> payments;

    private Totals totals;

    public static class Totals {
        @JsonProperty("total_employees")
        private int totalEmployees;

        @JsonProperty("total_gross_salary")
        private BigDecimal totalGrossSalary;

        @JsonProperty("total_net_salary")
        private BigDecimal totalNetSalary;

        @JsonProperty("total_employer_pension_contrib")
        private BigDecimal totalEmployerPensionContrib;

        @JsonProperty("total_employee_pension_deduction")
        private BigDecimal totalEmployeePensionDeduction;

        @JsonProperty("total_pension_contrib")
        private BigDecimal totalPensionContrib;

        @JsonProperty("total_debit")
        private BigDecimal totalDebit;

        public int getTotalEmployees() { return totalEmployees; }
        public void setTotalEmployees(int totalEmployees) { this.totalEmployees = totalEmployees; }

        public BigDecimal getTotalGrossSalary() { return totalGrossSalary; }
        public void setTotalGrossSalary(BigDecimal totalGrossSalary) { this.totalGrossSalary = totalGrossSalary; }

        public BigDecimal getTotalNetSalary() { return totalNetSalary; }
        public void setTotalNetSalary(BigDecimal totalNetSalary) { this.totalNetSalary = totalNetSalary; }

        public BigDecimal getTotalEmployerPensionContrib() { return totalEmployerPensionContrib; }
        public void setTotalEmployerPensionContrib(BigDecimal totalEmployerPensionContrib) { this.totalEmployerPensionContrib = totalEmployerPensionContrib; }

        public BigDecimal getTotalEmployeePensionDeduction() { return totalEmployeePensionDeduction; }
        public void setTotalEmployeePensionDeduction(BigDecimal totalEmployeePensionDeduction) { this.totalEmployeePensionDeduction = totalEmployeePensionDeduction; }

        public BigDecimal getTotalPensionContrib() { return totalPensionContrib; }
        public void setTotalPensionContrib(BigDecimal totalPensionContrib) { this.totalPensionContrib = totalPensionContrib; }

        public BigDecimal getTotalDebit() { return totalDebit; }
        public void setTotalDebit(BigDecimal totalDebit) { this.totalDebit = totalDebit; }
    }

    public String getPayrollId() { return payrollId; }
    public void setPayrollId(String payrollId) { this.payrollId = payrollId; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public String getEmployerId() { return employerId; }
    public void setEmployerId(String employerId) { this.employerId = employerId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }

    public List<PayrollDetailPaymentDTO> getPayments() { return payments; }
    public void setPayments(List<PayrollDetailPaymentDTO> payments) { this.payments = payments; }

    public Totals getTotals() { return totals; }
    public void setTotals(Totals totals) { this.totals = totals; }
}
