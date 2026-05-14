package com.highdev.breazelife.modules.fund.dto.response;

import com.highdev.breazelife.modules.fund.entity.Movement;
import com.highdev.breazelife.modules.fund.enums.FundType;
import com.highdev.breazelife.modules.fund.enums.MovementType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovementResponse(
    String movementId,
    String employerId,
    FundType fundType,
    MovementType type,
    BigDecimal amount,
    LocalDateTime date
) {
    public static MovementResponse from(Movement movement) {
        return new MovementResponse(
            movement.getId(),
            movement.getFund().getEmployerId(),
            movement.getFund().getType(),
            movement.getType(),
            movement.getAmount(),
            movement.getDate()
        );
    }
}