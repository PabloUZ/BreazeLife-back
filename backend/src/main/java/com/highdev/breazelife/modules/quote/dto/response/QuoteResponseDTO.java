package com.highdev.breazelife.modules.quote.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class QuoteResponseDTO {

    private String quoteId;
    private BigDecimal employerContrib;
    private BigDecimal affiliateContrib;
    private BigDecimal totalContrib;
    private Integer daysContributed;
    private LocalDateTime contribDate;
    private String status;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private String comment;
    private PaymentDTO payment;

    public static class PaymentDTO {
        private String paymentId;
        private BigDecimal netSalary;
        private BigDecimal grossSalary;
        private LocalDateTime date;

        // Getters y Setters
        public String getPaymentId() { return paymentId; }
        public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

        public BigDecimal getNetSalary() { return netSalary; }
        public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }

        public BigDecimal getGrossSalary() { return grossSalary; }
        public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; }

        public LocalDateTime getDate() { return date; }
        public void setDate(LocalDateTime date) { this.date = date; }
    }

    // Getters y Setters
    public String getQuoteId() { return quoteId; }
    public void setQuoteId(String quoteId) { this.quoteId = quoteId; }

    public BigDecimal getEmployerContrib() { return employerContrib; }
    public void setEmployerContrib(BigDecimal employerContrib) { this.employerContrib = employerContrib; }

    public BigDecimal getAffiliateContrib() { return affiliateContrib; }
    public void setAffiliateContrib(BigDecimal affiliateContrib) { this.affiliateContrib = affiliateContrib; }

    public BigDecimal getTotalContrib() { return totalContrib; }
    public void setTotalContrib(BigDecimal totalContrib) { this.totalContrib = totalContrib; }

    public Integer getDaysContributed() { return daysContributed; }
    public void setDaysContributed(Integer daysContributed) { this.daysContributed = daysContributed; }

    public LocalDateTime getContribDate() { return contribDate; }
    public void setContribDate(LocalDateTime contribDate) { this.contribDate = contribDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public PaymentDTO getPayment() { return payment; }
    public void setPayment(PaymentDTO payment) { this.payment = payment; }
}