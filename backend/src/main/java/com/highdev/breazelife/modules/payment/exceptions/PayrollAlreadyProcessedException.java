package com.highdev.breazelife.modules.payment.exceptions;

public class PayrollAlreadyProcessedException extends RuntimeException {

    public PayrollAlreadyProcessedException() {
        super("Payroll for this period has already been processed");
    }
}
