package com.highdev.breazelife.modules.quote.exceptions;

public class InvalidDateRangeException extends RuntimeException {
    private final String code;
    public InvalidDateRangeException() {
        super("Invalid date range: 'from' must be before 'to'");
        this.code = "INVALID_DATE_RANGE";
    }

    public String getCode() {
        return this.code;
    }
}

