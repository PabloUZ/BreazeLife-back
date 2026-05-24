package com.highdev.breazelife.modules.payment.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class PayrollExceptionHandler {

    @ExceptionHandler(PayrollAlreadyProcessedException.class)
    public ResponseEntity<Map<String, Object>> handleAlreadyProcessed(PayrollAlreadyProcessedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(errorBody(ex.getMessage(), "PAYROLL_ALREADY_PROCESSED", 409, "CONFLICT"));
    }

    @ExceptionHandler(NoActiveEmployeesException.class)
    public ResponseEntity<Map<String, Object>> handleNoActiveEmployees(NoActiveEmployeesException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(errorBody(ex.getMessage(), "NO_ACTIVE_EMPLOYEES", 400, "BAD_REQUEST"));
    }

    @ExceptionHandler(PayrollInsufficientFundsException.class)
    public ResponseEntity<Map<String, Object>> handleInsufficientFunds(PayrollInsufficientFundsException ex) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("payroll_fund_balance", ex.getPayrollFundBalance());
        data.put("payroll_fund_required", ex.getPayrollFundRequired());
        data.put("pension_fund_balance", ex.getPensionFundBalance());
        data.put("pension_fund_required", ex.getPensionFundRequired());
        data.put("payroll_fund_sufficient", ex.getPayrollFundBalance().compareTo(ex.getPayrollFundRequired()) >= 0);
        data.put("pension_fund_sufficient", ex.getPensionFundBalance().compareTo(ex.getPensionFundRequired()) >= 0);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", ex.getMessage());
        body.put("message_code", "INSUFFICIENT_FUNDS");
        body.put("status_code", 422);
        body.put("status", "UNPROCESSABLE_ENTITY");
        body.put("data", data);

        return ResponseEntity.status(422).body(body);
    }

    @ExceptionHandler(PayrollNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handlePayrollNotFound(PayrollNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(errorBody(ex.getMessage(), "PAYROLL_NOT_FOUND", 404, "NOT_FOUND"));
    }

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handlePaymentNotFound(PaymentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(errorBody(ex.getMessage(), "PAYMENT_NOT_FOUND", 404, "NOT_FOUND"));
    }

    @ExceptionHandler(PaymentAccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handlePaymentAccessDenied(PaymentAccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(errorBody(ex.getMessage(), "ACCESS_DENIED", 403, "FORBIDDEN"));
    }

    @ExceptionHandler(PaymentDateRangeException.class)
    public ResponseEntity<Map<String, Object>> handlePaymentDateRange(PaymentDateRangeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(errorBody(ex.getMessage(), "INVALID_DATE_RANGE", 400, "BAD_REQUEST"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(errorBody("Invalid input data", "INVALID_INPUT", 400, "BAD_REQUEST"));
    }

    private Map<String, Object> errorBody(String message, String messageCode, int statusCode, String status) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", message);
        body.put("message_code", messageCode);
        body.put("status_code", statusCode);
        body.put("status", status);
        return body;
    }
}
