package com.highdev.breazelife.modules.payment.exceptions;

public class PaymentDateRangeException extends RuntimeException {
    public PaymentDateRangeException() {
        super("Invalid date range");
    }
}
