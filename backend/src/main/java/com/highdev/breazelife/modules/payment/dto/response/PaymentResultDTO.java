package com.highdev.breazelife.modules.payment.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class PaymentResultDTO {

    @JsonProperty("payment_id")
    private String paymentId;

    @JsonProperty("contract_id")
    private String contractId;

    @JsonProperty("affiliate_name")
    private String affiliateName;

    private String document;

    @JsonProperty("net_salary")
    private BigDecimal netSalary;

    @JsonProperty("quote_id")
    private String quoteId;

    private String status;

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getContractId() { return contractId; }
    public void setContractId(String contractId) { this.contractId = contractId; }

    public String getAffiliateName() { return affiliateName; }
    public void setAffiliateName(String affiliateName) { this.affiliateName = affiliateName; }

    public String getDocument() { return document; }
    public void setDocument(String document) { this.document = document; }

    public BigDecimal getNetSalary() { return netSalary; }
    public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }

    public String getQuoteId() { return quoteId; }
    public void setQuoteId(String quoteId) { this.quoteId = quoteId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
