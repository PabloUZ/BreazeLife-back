package com.highdev.breazelife.modules.payment.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
public class EmployeePayrollPreviewResponse {

    @JsonProperty("contract_id")
    private String contractId;

    @JsonProperty("affiliate_name")
    private String affiliateName;

    private String document;
    private String position;

    @JsonProperty("base_salary")
    private BigDecimal baseSalary;

    @JsonProperty("employee_pension_deduction")
    private BigDecimal employeePensionDeduction;

    @JsonProperty("net_salary")
    private BigDecimal netSalary;

    @JsonProperty("employer_pension_contrib")
    private BigDecimal employerPensionContrib;

    @JsonProperty("total_pension_contrib")
    private BigDecimal totalPensionContrib;

    @JsonProperty("payroll_fund_debit")
    private BigDecimal payrollFundDebit;

    @JsonProperty("pension_fund_debit")
    private BigDecimal pensionFundDebit;

}