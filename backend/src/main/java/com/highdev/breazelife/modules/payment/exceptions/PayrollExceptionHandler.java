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
