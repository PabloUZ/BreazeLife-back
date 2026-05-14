package com.highdev.breazelife.modules.fund.dto.response;

import com.highdev.breazelife.modules.fund.entity.Fund;
import com.highdev.breazelife.modules.fund.enums.FundType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FundResponse(
    String employerId,
    FundType type,
    BigDecimal balance,
    LocalDateTime updatedAt
) {
    public static FundResponse from(Fund fund) {
        return new FundResponse(
            fund.getId().getEmployerId(),
            fund.getId().getType(),
            fund.getBalance(),
            fund.getUpdatedAt()
        );
    }
}