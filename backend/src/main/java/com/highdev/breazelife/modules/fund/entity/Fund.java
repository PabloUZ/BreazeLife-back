package com.highdev.breazelife.modules.fund.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "funds")
public class Fund {

    @EmbeddedId
    private FundId id;

    @Column(name = "balance", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    //metodos para manipular el saldo
    public void addFunds(BigDecimal amount) {
        this.balance = this.balance.add(amount);
    }

    public void deductFunds(BigDecimal amount) {
        this.balance = this.balance.subtract(amount);
    }
}