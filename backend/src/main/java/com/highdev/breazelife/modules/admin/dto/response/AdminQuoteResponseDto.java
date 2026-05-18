package com.highdev.breazelife.modules.admin.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminQuoteResponseDto {
    private final String quoteId;
    private final String accountId;
    private final String paymentId;
    private final BigDecimal employerContribution;
    private final BigDecimal affiliateContribution;
    private final BigDecimal totalContribution;
    private final Integer daysContributed;
    private final LocalDateTime contributionDate;
    private final String status;
    private final String reviewedBy;
    private final LocalDateTime reviewedAt;
    private final String comment;

    public AdminQuoteResponseDto(
            String quoteId,
            String accountId,
            String paymentId,
            BigDecimal employerContribution,
            BigDecimal affiliateContribution,
            BigDecimal totalContribution,
            Integer daysContributed,
            LocalDateTime contributionDate,
            String status,
            String reviewedBy,
            LocalDateTime reviewedAt,
            String comment
    ) {
        this.quoteId = quoteId;
        this.accountId = accountId;
        this.paymentId = paymentId;
        this.employerContribution = employerContribution;
        this.affiliateContribution = affiliateContribution;
        this.totalContribution = totalContribution;
        this.daysContributed = daysContributed;
        this.contributionDate = contributionDate;
        this.status = status;
        this.reviewedBy = reviewedBy;
        this.reviewedAt = reviewedAt;
        this.comment = comment;
    }

    public String getQuoteId() {
        return quoteId;
    }

    public String getAccountId() {
        return accountId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public BigDecimal getEmployerContribution() {
        return employerContribution;
    }

    public BigDecimal getAffiliateContribution() {
        return affiliateContribution;
    }

    public BigDecimal getTotalContribution() {
        return totalContribution;
    }

    public Integer getDaysContributed() {
        return daysContributed;
    }

    public LocalDateTime getContributionDate() {
        return contributionDate;
    }

    public String getStatus() {
        return status;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public String getComment() {
        return comment;
    }
}
