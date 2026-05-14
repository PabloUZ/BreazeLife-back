package com.highdev.breazelife.modules.fund.exceptions;

import com.highdev.breazelife.modules.fund.enums.FundType;

public class FundNotFoundException extends RuntimeException {

    public FundNotFoundException(String employerId, FundType type) {
        super("Fund not found for employer " + employerId + " and type " + type);
    }

    public FundNotFoundException(String employerId) {
        super("Funds not found for employer " + employerId);
    }
}