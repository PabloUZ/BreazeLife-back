package com.highdev.breazelife.modules.payment.exceptions;

public class PayrollNotFoundException extends RuntimeException {
    public PayrollNotFoundException() {
        super("Payroll not found");
    }
}
