package com.highdev.breazelife.modules.fund.entity;

import com.highdev.breazelife.modules.fund.enums.FundType;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class FundId implements Serializable {

    @Column(name = "employer_id", length = 36, nullable = false)
    private String employerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private FundType type;
}