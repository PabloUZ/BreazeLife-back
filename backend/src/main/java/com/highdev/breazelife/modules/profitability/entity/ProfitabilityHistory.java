package com.highdev.breazelife.modules.profitability.entity;

import com.highdev.breazelife.modules.account.entity.Account;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Entity
@Table(name = "profitability_history")
public class ProfitabilityHistory {

    @Id
    @Column(length = 20)
    private String id;

    @ManyToOne
    @JoinColumn(name = "account")
    private Account account;

    @Column(precision = 15, scale = 2)
    private BigDecimal profit;

    private LocalDate date;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = generateProfitabilityId();
        }
    }

    private String generateProfitabilityId() {
        String dateString = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        return "PRH-" + dateString + "-" + random;
    }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
