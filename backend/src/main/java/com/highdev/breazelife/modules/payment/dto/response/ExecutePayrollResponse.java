package com.highdev.breazelife.modules.payment.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public class ExecutePayrollResponse {

    private String period;

    @JsonProperty("employer_id")
    private String employerId;

    @JsonProperty("company_name")
    private String companyName;

    private String status;

    private List<PaymentResultDTO> payments;

    private Totals totals;

    @JsonProperty("payroll_fund_remaining")
    private BigDecimal payrollFundRemaining;

    @JsonProperty("pension_fund_remaining")
    private BigDecimal pensionFundRemaining;

    public static class Totals {

        @JsonProperty("total_employees")
        private int totalEmployees;

        @JsonProperty("total_net_salary_paid")
        private BigDecimal totalNetSalaryPaid;

        @JsonProperty("total_pension_contrib")
        private BigDecimal totalPensionContrib;

        @JsonProperty("total_debit")
        private BigDecimal totalDebit;

        public int getTotalEmployees() { return totalEmployees; }
        public void setTotalEmployees(int totalEmployees) { this.totalEmployees = totalEmployees; }

        public BigDecimal getTotalNetSalaryPaid() { return totalNetSalaryPaid; }
        public void setTotalNetSalaryPaid(BigDecimal totalNetSalaryPaid) { this.totalNetSalaryPaid = totalNetSalaryPaid; }

        public BigDecimal getTotalPensionContrib() { return totalPensionContrib; }
        public void setTotalPensionContrib(BigDecimal totalPensionContrib) { this.totalPensionContrib = totalPensionContrib; }

        public BigDecimal getTotalDebit() { return totalDebit; }
        public void setTotalDebit(BigDecimal totalDebit) { this.totalDebit = totalDebit; }
    }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public String getEmployerId() { return employerId; }
    public void setEmployerId(String employerId) { this.employerId = employerId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<PaymentResultDTO> getPayments() { return payments; }
    public void setPayments(List<PaymentResultDTO> payments) { this.payments = payments; }

    public Totals getTotals() { return totals; }
    public void setTotals(Totals totals) { this.totals = totals; }

    public BigDecimal getPayrollFundRemaining() { return payrollFundRemaining; }
    public void setPayrollFundRemaining(BigDecimal payrollFundRemaining) { this.payrollFundRemaining = payrollFundRemaining; }

    public BigDecimal getPensionFundRemaining() { return pensionFundRemaining; }
    public void setPensionFundRemaining(BigDecimal pensionFundRemaining) { this.pensionFundRemaining = pensionFundRemaining; }
}
