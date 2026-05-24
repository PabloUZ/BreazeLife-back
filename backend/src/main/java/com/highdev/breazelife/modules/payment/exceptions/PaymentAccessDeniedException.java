package com.highdev.breazelife.modules.payment.exceptions;

public class PaymentAccessDeniedException extends RuntimeException {
    public PaymentAccessDeniedException() {
        super("Access denied to this payment record");
    }
}
