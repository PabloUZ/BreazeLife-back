package com.highdev.breazelife.modules.payment.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class PayrollPreviewResponse {

    private String period;
    private String employerId;
    private String companyName;
    private BigDecimal payrollFundBalance;
    private BigDecimal pensionFundBalance;
    private List<EmployeePayrollPreviewResponse> employees;
    private Totals totals;
    private FundStatus fundStatus;

    // ─── Totals ───────────────────────────────────────────────────────────────

    public static class Totals {
        private int totalEmployees;
        private BigDecimal totalGrossSalary;
        private BigDecimal totalNetSalary;
        private BigDecimal totalEmployerPensionContrib;
        private BigDecimal totalEmployeePensionDeduction;
        private BigDecimal totalPensionContrib;
        private BigDecimal totalPayrollFundDebit;
        private BigDecimal totalPensionFundDebit;
        private BigDecimal totalDebit;  // totalPayrollFundDebit + totalPensionFundDebit

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
        private boolean payrollFundSufficient;
        private boolean pensionFundSufficient;
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