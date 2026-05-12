package com.highdev.breazelife.modules.payment.dto.response;

import java.math.BigDecimal;

public class EmployeePayrollPreviewResponse {

    private String contractId;
    private String affiliateName;
    private String document;
    private String position;
    private BigDecimal baseSalary;
    private BigDecimal employeePensionDeduction;  // IBC * 0.04
    private BigDecimal netSalary;                 // IBC * 0.96
    private BigDecimal employerPensionContrib;    // IBC * 0.12
    private BigDecimal totalPensionContrib;       // IBC * 0.16
    private BigDecimal payrollFundDebit;          // lo que sale del fondo nómina = netSalary
    private BigDecimal pensionFundDebit;          // lo que sale del fondo aportes = employerPensionContrib

    public String getContractId() { return contractId; }
    public void setContractId(String contractId) { this.contractId = contractId; }

    public String getAffiliateName() { return affiliateName; }
    public void setAffiliateName(String affiliateName) { this.affiliateName = affiliateName; }

    public String getDocument() { return document; }
    public void setDocument(String document) { this.document = document; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }

    public BigDecimal getEmployeePensionDeduction() { return employeePensionDeduction; }
    public void setEmployeePensionDeduction(BigDecimal employeePensionDeduction) { this.employeePensionDeduction = employeePensionDeduction; }

    public BigDecimal getNetSalary() { return netSalary; }
    public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }

    public BigDecimal getEmployerPensionContrib() { return employerPensionContrib; }
    public void setEmployerPensionContrib(BigDecimal employerPensionContrib) { this.employerPensionContrib = employerPensionContrib; }

    public BigDecimal getTotalPensionContrib() { return totalPensionContrib; }
    public void setTotalPensionContrib(BigDecimal totalPensionContrib) { this.totalPensionContrib = totalPensionContrib; }

    public BigDecimal getPayrollFundDebit() { return payrollFundDebit; }
    public void setPayrollFundDebit(BigDecimal payrollFundDebit) { this.payrollFundDebit = payrollFundDebit; }

    public BigDecimal getPensionFundDebit() { return pensionFundDebit; }
    public void setPensionFundDebit(BigDecimal pensionFundDebit) { this.pensionFundDebit = pensionFundDebit; }
}