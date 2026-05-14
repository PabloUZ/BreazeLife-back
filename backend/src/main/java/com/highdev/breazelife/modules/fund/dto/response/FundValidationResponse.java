package com.highdev.breazelife.modules.fund.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record FundValidationResponse(
    boolean valid,
    FundDetail payrollFund,
    FundDetail pensionFund,
    List<InsufficientFundDetail> insufficientFunds
) {
    public record FundDetail(
        String employerId,
        String type,
        BigDecimal currentBalance,
        BigDecimal required
    ) {}

    public record InsufficientFundDetail(
        String fundType,
        BigDecimal currentBalance,
        BigDecimal required,
        BigDecimal shortage
    ) {}
}