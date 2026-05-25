package com.highdev.breazelife.modules.payment.exceptions;

import java.math.BigDecimal;

public class PayrollInsufficientFundsException extends RuntimeException {

    private final BigDecimal payrollFundBalance;
    private final BigDecimal payrollFundRequired;
    private final BigDecimal pensionFundBalance;
    private final BigDecimal pensionFundRequired;

    public PayrollInsufficientFundsException(
            BigDecimal payrollFundBalance, BigDecimal payrollFundRequired,
            BigDecimal pensionFundBalance, BigDecimal pensionFundRequired) {
        super("Payroll cancelled due to insufficient funds");
        this.payrollFundBalance = payrollFundBalance;
        this.payrollFundRequired = payrollFundRequired;
        this.pensionFundBalance = pensionFundBalance;
        this.pensionFundRequired = pensionFundRequired;
    }

    public BigDecimal getPayrollFundBalance() { return payrollFundBalance; }
    public BigDecimal getPayrollFundRequired() { return payrollFundRequired; }
    public BigDecimal getPensionFundBalance() { return pensionFundBalance; }
    public BigDecimal getPensionFundRequired() { return pensionFundRequired; }
}
