package com.highdev.breazelife.modules.quote.entity;

import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.admin.entity.Admin;
import com.highdev.breazelife.modules.payment.entity.Payment;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "quotes")
public class Quote {

    @Id
    @Column(length = 20)
    private String id;

    @ManyToOne
    @JoinColumn(name = "account")
    private Account account;

    @OneToOne
    @JoinColumn(name = "payment", unique = true)
    private Payment payment;

    @Column(name = "employer_contrib", precision = 15, scale = 2)
    private BigDecimal employerContrib;

    @Column(name = "affiliate_contrib", precision = 15, scale = 2)
    private BigDecimal affiliateContrib;

    @Column(name = "days_contributed")
    private Integer daysContributed;

    @Column(name = "contrib_date")
    private LocalDateTime contribDate;

    @Enumerated(EnumType.STRING)
    private QuoteStatus status = QuoteStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private Admin reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(columnDefinition = "TEXT")
    private String comment;

    public enum QuoteStatus {
        PENDING, ACCEPTED, REJECTED
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }

    public BigDecimal getEmployerContrib() { return employerContrib; }
    public void setEmployerContrib(BigDecimal employerContrib) { this.employerContrib = employerContrib; }

    public BigDecimal getAffiliateContrib() { return affiliateContrib; }
    public void setAffiliateContrib(BigDecimal affiliateContrib) { this.affiliateContrib = affiliateContrib; }

    public Integer getDaysContributed() { return daysContributed; }
    public void setDaysContributed(Integer daysContributed) { this.daysContributed = daysContributed; }

    public LocalDateTime getContribDate() { return contribDate; }
    public void setContribDate(LocalDateTime contribDate) { this.contribDate = contribDate; }

    public QuoteStatus getStatus() { return status; }
    public void setStatus(QuoteStatus status) { this.status = status; }

    public Admin getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(Admin reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
