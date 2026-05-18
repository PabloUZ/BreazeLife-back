package com.highdev.breazelife.modules.admin.exceptions;

import com.highdev.breazelife.shared.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AdminAccountExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(AdminAccountExceptionHandler.class);

    @ExceptionHandler(AdminAccountException.class)
    public ResponseEntity<ErrorResponse> handleAdminAccountException(AdminAccountException ex) {
        logger.error("Admin account error [{}]: {}", ex.getCode(), ex.getMessage(), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(
                        ex.getMessage(),
                        ex.getCode(),
                        500,
                        "INTERNAL_SERVER_ERROR"
                ));
    }
}
