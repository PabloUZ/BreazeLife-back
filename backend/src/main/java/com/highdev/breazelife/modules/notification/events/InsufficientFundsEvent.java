package com.highdev.breazelife.modules.notification.events;

public record InsufficientFundsEvent(
        String employerId,
        FundType fundType
) {
    public enum FundType { PAYROLL, EMPLOYER_CONTRIBUTIONS }
}
