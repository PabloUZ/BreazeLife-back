package com.highdev.breazelife.modules.movement.entity;

import com.highdev.breazelife.modules.fund.entity.Fund;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movements")
public class Movement {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "funds_id", length = 36, nullable = false)
    private String fundsId;

    @Enumerated(EnumType.STRING)
    @Column(name = "fund_type", nullable = false)
    private Fund.FundType fundType;

    @Enumerated(EnumType.STRING)
    private MovementType type;

    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    private LocalDateTime date;

    public enum MovementType {
        INCOME, OUTCOME
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFundsId() { return fundsId; }
    public void setFundsId(String fundsId) { this.fundsId = fundsId; }

    public Fund.FundType getFundType() { return fundType; }
    public void setFundType(Fund.FundType fundType) { this.fundType = fundType; }

    public MovementType getType() { return type; }
    public void setType(MovementType type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
}
