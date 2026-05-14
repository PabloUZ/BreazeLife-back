package com.highdev.breazelife.modules.fund.entity;

import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.fund.enums.FundType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "funds")
@IdClass(FundId.class)
public class Fund {

    @Id
    @Column(name = "employer_id", length = 36)
    private String employerId;

    @Id
    @Enumerated(EnumType.STRING)
    private FundType type;

    @ManyToOne
    @JoinColumn(name = "employer_id", insertable = false, updatable = false)
    private Employer employer;

    @Column(precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getEmployerId() { return employerId; }
    public void setEmployerId(String employerId) { this.employerId = employerId; }

    public FundType getType() { return type; }
    public void setType(FundType type) { this.type = type; }

    public Employer getEmployer() { return employer; }
    public void setEmployer(Employer employer) { this.employer = employer; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
