package com.highdev.breazelife.modules.payment.exceptions;

public class NoActiveEmployeesException extends RuntimeException {

    public NoActiveEmployeesException() {
        super("No active employees found for this employer");
    }
}
