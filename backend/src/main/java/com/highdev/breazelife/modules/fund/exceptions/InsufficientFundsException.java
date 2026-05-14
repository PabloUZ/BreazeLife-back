package com.highdev.breazelife.modules.fund.exceptions;

import com.highdev.breazelife.modules.fund.enums.FundType;
import java.math.BigDecimal;
import java.util.List;

public class InsufficientFundsException extends RuntimeException {

    private final List<FundShortage> shortages;

    public InsufficientFundsException(List<FundShortage> shortages) {
        super("Insufficient funds to execute payroll");
        this.shortages = shortages;
    }

    public List<FundShortage> getShortages() {
        return shortages;
    }

    public record FundShortage(
        FundType fundType,
        BigDecimal currentBalance,
        BigDecimal required,
        BigDecimal shortage
    ) {}
}