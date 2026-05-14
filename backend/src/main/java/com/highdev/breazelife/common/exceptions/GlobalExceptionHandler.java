package com.highdev.breazelife.common.exceptions;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.highdev.breazelife.modules.affiliate.exceptions.AffiliateNotFoundException;
import com.highdev.breazelife.modules.quote.exceptions.InvalidDateRangeException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AffiliateNotFoundException.class)
    public ResponseEntity<?> handleAffiliateNotFound(AffiliateNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of(
                "message", "Affiliate not found",
                "message_code", "AFFILIATE_NOT_FOUND",
                "status_code", 404,
                "status", "NOT_FOUND"
        ));
    }

    @ExceptionHandler(InvalidDateRangeException.class)
    public ResponseEntity<?> handleInvalidDateRange(InvalidDateRangeException e) {
        return ResponseEntity.status(400).body(Map.of(
                "message", "Invalid date range: 'from' must be before 'to'",
                "message_code", "INVALID_DATE_RANGE",
                "status_code", 400,
                "status", "BAD_REQUEST"
        ));
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception e) {
        return ResponseEntity.status(500).body(Map.of(
                "message", "Internal server error",
                "message_code", "INTERNAL_ERROR",
                "status_code", 500,
                "status", "INTERNAL_SERVER_ERROR"
        ));
    }
}