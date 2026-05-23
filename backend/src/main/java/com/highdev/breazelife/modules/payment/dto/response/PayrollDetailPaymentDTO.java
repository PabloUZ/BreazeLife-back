package com.highdev.breazelife.modules.payment.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class PayrollDetailPaymentDTO {

    @JsonProperty("payment_id")
    private String paymentId;

    @JsonProperty("contract_id")
    private String contractId;

    @JsonProperty("affiliate_name")
    private String affiliateName;

    private String document;
    private String position;

    @JsonProperty("base_salary")
    private BigDecimal baseSalary;

    @JsonProperty("employee_pension_deduction")
    private BigDecimal employeePensionDeduction;

    @JsonProperty("net_salary")
    private BigDecimal netSalary;

    @JsonProperty("employer_pension_contrib")
    private BigDecimal employerPensionContrib;

    @JsonProperty("total_pension_contrib")
    private BigDecimal totalPensionContrib;

    @JsonProperty("days_contributed")
    private int daysContributed;

    @JsonProperty("quote_id")
    private String quoteId;

    @JsonProperty("quote_status")
    private String quoteStatus;

    private String status;

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

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

    public int getDaysContributed() { return daysContributed; }
    public void setDaysContributed(int daysContributed) { this.daysContributed = daysContributed; }

    public String getQuoteId() { return quoteId; }
    public void setQuoteId(String quoteId) { this.quoteId = quoteId; }

    public String getQuoteStatus() { return quoteStatus; }
    public void setQuoteStatus(String quoteStatus) { this.quoteStatus = quoteStatus; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
