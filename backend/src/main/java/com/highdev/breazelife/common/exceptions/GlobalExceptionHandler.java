package com.highdev.breazelife.common.exceptions;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.highdev.breazelife.modules.affiliate.exceptions.AffiliateNotFoundException;
import com.highdev.breazelife.modules.quote.exceptions.InvalidDateRangeException;

import com.highdev.breazelife.common.exceptions.http.BadRequestException;
import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.modules.affiliate.exceptions.AffiliateAlreadyExistsException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {


    

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFoundException(NotFoundException e) {
        return ResponseEntity.status(404).body(Map.of(
                "message", e.getMessage(),
                "message_code", "NOT_FOUND",
                "status_code", 404,
                "status", "NOT_FOUND"
        ));
    }

    @ExceptionHandler(BadRequestException.class)
public ResponseEntity<?> handleBadRequestException(BadRequestException e) {
    return ResponseEntity.status(400).body(Map.of(
            "message", e.getMessage(),
            "message_code", "BAD_REQUEST",
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

    @ExceptionHandler(AffiliateAlreadyExistsException.class)
    public ResponseEntity<?> handleAffiliateAlreadyExists(AffiliateAlreadyExistsException e) {
        return ResponseEntity.status(409).body(Map.of( // 409 es Conflict
                "message", e.getMessage(),
                "message_code", "DOCUMENT_ALREADY_EXISTS",
                "status_code", 409,
                "status", "CONFLICT"
        ));
    }
}