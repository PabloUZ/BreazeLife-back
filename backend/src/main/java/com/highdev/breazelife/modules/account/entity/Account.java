package com.highdev.breazelife.modules.account.entity;

import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import jakarta.persistence.*;

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
