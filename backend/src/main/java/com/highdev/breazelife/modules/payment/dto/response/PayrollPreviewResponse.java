package com.highdev.breazelife.modules.payment.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public class PayrollPreviewResponse {

    private String period;

    @JsonProperty("employer_id")
    private String employerId;

    @JsonProperty("company_name")
    private String companyName;

    @JsonProperty("payroll_fund_balance")
    private BigDecimal payrollFundBalance;

    @JsonProperty("pension_fund_balance")
    private BigDecimal pensionFundBalance;

    private List<EmployeePayrollPreviewResponse> employees;
    private Totals totals;

    @JsonProperty("fund_status")
    private FundStatus fundStatus;

    // ─── Totals ───────────────────────────────────────────────────────────────

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

        @JsonProperty("total_payroll_fund_debit")
        private BigDecimal totalPayrollFundDebit;

        @JsonProperty("total_pension_fund_debit")
        private BigDecimal totalPensionFundDebit;

        @JsonProperty("total_debit")
        private BigDecimal totalDebit;

        public int getTotalEmployees() { return totalEmployees; }
        public void setTotalEmployees(int totalEmployees) { this.totalEmployees = totalEmployees; }

        public BigDecimal getTotalGrossSalary() { return totalGrossSalary; }
        public void setTotalGrossSalary(BigDecimal totalGrossSalary) { this.totalGrossSalary = totalGrossSalary; }

        public BigDecimal getTotalNetSalary() { return totalNetSalary; }
        public void setTotalNetSalary(BigDecimal totalNetSalary) { this.totalNetSalary = totalNetSalary; }

        public BigDecimal getTotalEmployerPensionContrib() { return totalEmployerPensionContrib; }
        public void setTotalEmployerPensionContrib(BigDecimal v) { this.totalEmployerPensionContrib = v; }

        public BigDecimal getTotalEmployeePensionDeduction() { return totalEmployeePensionDeduction; }
        public void setTotalEmployeePensionDeduction(BigDecimal v) { this.totalEmployeePensionDeduction = v; }

        public BigDecimal getTotalPensionContrib() { return totalPensionContrib; }
        public void setTotalPensionContrib(BigDecimal totalPensionContrib) { this.totalPensionContrib = totalPensionContrib; }

        public BigDecimal getTotalPayrollFundDebit() { return totalPayrollFundDebit; }
        public void setTotalPayrollFundDebit(BigDecimal v) { this.totalPayrollFundDebit = v; }

        public BigDecimal getTotalPensionFundDebit() { return totalPensionFundDebit; }
        public void setTotalPensionFundDebit(BigDecimal v) { this.totalPensionFundDebit = v; }

        public BigDecimal getTotalDebit() { return totalDebit; }
        public void setTotalDebit(BigDecimal totalDebit) { this.totalDebit = totalDebit; }
    }

    // ─── FundStatus ───────────────────────────────────────────────────────────

    public static class FundStatus {
        @JsonProperty("payroll_fund_sufficient")
        private boolean payrollFundSufficient;

        @JsonProperty("pension_fund_sufficient")
        private boolean pensionFundSufficient;

        @JsonProperty("can_execute")
        private boolean canExecute;

        public boolean isPayrollFundSufficient() { return payrollFundSufficient; }
        public void setPayrollFundSufficient(boolean v) { this.payrollFundSufficient = v; }

        public boolean isPensionFundSufficient() { return pensionFundSufficient; }
        public void setPensionFundSufficient(boolean v) { this.pensionFundSufficient = v; }

        public boolean isCanExecute() { return canExecute; }
        public void setCanExecute(boolean canExecute) { this.canExecute = canExecute; }
    }

    // ─── Getters/Setters principales ─────────────────────────────────────────

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public String getEmployerId() { return employerId; }
    public void setEmployerId(String employerId) { this.employerId = employerId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public BigDecimal getPayrollFundBalance() { return payrollFundBalance; }
    public void setPayrollFundBalance(BigDecimal payrollFundBalance) { this.payrollFundBalance = payrollFundBalance; }

    public BigDecimal getPensionFundBalance() { return pensionFundBalance; }
    public void setPensionFundBalance(BigDecimal pensionFundBalance) { this.pensionFundBalance = pensionFundBalance; }

    public List<EmployeePayrollPreviewResponse> getEmployees() { return employees; }
    public void setEmployees(List<EmployeePayrollPreviewResponse> employees) { this.employees = employees; }

    public Totals getTotals() { return totals; }
    public void setTotals(Totals totals) { this.totals = totals; }

    public FundStatus getFundStatus() { return fundStatus; }
    public void setFundStatus(FundStatus fundStatus) { this.fundStatus = fundStatus; }
}