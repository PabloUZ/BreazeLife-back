package com.highdev.breazelife.modules.fund.entity;

import com.highdev.breazelife.modules.fund.enums.MovementType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "movements")
public class Movement {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    //relación con Fund usando la llave compuesta
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "funds_id", referencedColumnName = "employer_id"),
        @JoinColumn(name = "fund_type", referencedColumnName = "type")
    })
    private Fund fund;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private MovementType type;

    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount;

    @CreationTimestamp
    @Column(name = "date")
    private LocalDateTime date;

    //generar UUID automaticamente antes de persistir
    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}