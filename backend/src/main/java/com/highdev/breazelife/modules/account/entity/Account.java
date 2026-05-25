package com.highdev.breazelife.modules.account.entity;

import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @Column(length = 20)
    private String id;

    @OneToOne
    @JoinColumn(name = "affiliate", unique = true)
    private Affiliate affiliate;

    @Column(precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type")
    private AccountType accountType;

    @Column(name = "quoted_days")
    private Integer quotedDays = 0;

    public enum AccountType {
        CONSERVATIVE, MODERATE, RISKY
    }

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = generateAccountId();
        }
    }

    private String generateAccountId() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        return "ACC-" + date + "-" + random;
    }

    public void accumulateContribution(BigDecimal contributionAmount, int days) {
        BigDecimal normalizedContribution = contributionAmount != null ? contributionAmount : BigDecimal.ZERO;
        this.balance = this.balance.add(normalizedContribution);

        int normalizedDays = Math.max(days, 0);
        this.quotedDays = (this.quotedDays != null ? this.quotedDays : 0) + normalizedDays;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Affiliate getAffiliate() { return affiliate; }
    public void setAffiliate(Affiliate affiliate) { this.affiliate = affiliate; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }

    public Integer getQuotedDays() { return quotedDays; }
    public void setQuotedDays(Integer quotedDays) { this.quotedDays = quotedDays; }
}
