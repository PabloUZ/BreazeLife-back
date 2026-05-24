package com.highdev.breazelife.modules.payment.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AffiliatePaymentItemDTO {

    @JsonProperty("payment_id")
    private String paymentId;

    private String period;

    @JsonProperty("company_name")
    private String companyName;

    private String position;

    @JsonProperty("base_salary")
    private BigDecimal baseSalary;

    @JsonProperty("net_salary")
    private BigDecimal netSalary;

    @JsonProperty("total_pension_contrib")
    private BigDecimal totalPensionContrib;

    private String status;

    @JsonProperty("paid_at")
    private LocalDateTime paidAt;

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }

    public BigDecimal getNetSalary() { return netSalary; }
    public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }

    public BigDecimal getTotalPensionContrib() { return totalPensionContrib; }
    public void setTotalPensionContrib(BigDecimal totalPensionContrib) { this.totalPensionContrib = totalPensionContrib; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}
