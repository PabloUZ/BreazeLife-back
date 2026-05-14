package com.highdev.breazelife.modules.fund.exceptions;

import com.highdev.breazelife.modules.fund.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;

@RestControllerAdvice
public class FundsExceptionHandler {

    @ExceptionHandler(FundNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleFundNotFound(FundNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage(), "FUND_NOT_FOUND", 404, "NOT_FOUND"));
    }

    @ExceptionHandler(InsufficientFundsException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleInsufficientFunds(InsufficientFundsException ex) {
        Map<String, Object> data = Map.of(
            "valid", false,
            "insufficient_funds", ex.getShortages()
        );
        
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.errorWithData(
                        ex.getMessage(), 
                        "INSUFFICIENT_FUNDS", 
                        422, 
                        "UNPROCESSABLE_ENTITY", 
                        data
                ));
    }

    // Captura cuando mandan algo distinto a PAYROLL o PENSION en la URL
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        if (ex.getRequiredType() != null && ex.getRequiredType().isEnum()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid fund type. Must be PAYROLL or PENSION", "INVALID_FUND_TYPE", 400, "BAD_REQUEST"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid parameter: " + ex.getName(), "INVALID_PARAM", 400, "BAD_REQUEST"));
    }
}