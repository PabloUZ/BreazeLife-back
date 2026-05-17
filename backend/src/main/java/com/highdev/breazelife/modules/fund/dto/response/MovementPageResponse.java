package com.highdev.breazelife.modules.fund.dto.response;

import com.highdev.breazelife.modules.fund.enums.FundType;
import java.util.List;

public record MovementPageResponse(
    String employerId,
    FundType fundType,
    long totalRecords,
    int page,
    int limit,
    List<MovementResponse> movements
) {}