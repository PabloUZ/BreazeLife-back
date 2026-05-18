package com.highdev.breazelife.shared.handlers;

import com.highdev.breazelife.common.exceptions.http.BadRequestException;
import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.modules.affiliate.exceptions.AffiliateAlreadyExistsException;
import com.highdev.breazelife.modules.auth.exception.InvalidCredentialsException;
import com.highdev.breazelife.modules.auth.exception.InvalidRefreshTokenException;
import com.highdev.breazelife.modules.user.exception.EmailAlreadyExistsException;
import com.highdev.breazelife.modules.user.exception.UserNotFoundException;
import com.highdev.breazelife.shared.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import com.highdev.breazelife.modules.quote.exceptions.QuoteAlreadyProcessedException;
import com.highdev.breazelife.modules.affiliate.exceptions.AffiliateNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── User ──────────────────────────────────────────────────────────────────

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(ex.getMessage(), "USER_NOT_FOUND", 404, "NOT_FOUND"));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(ex.getMessage(), "EMAIL_ALREADY_EXISTS", 409, "CONFLICT"));
    }

    // ── Auth ──────────────────────────────────────────────────────────────────

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(ex.getMessage(), "INVALID_CREDENTIALS", 401, "UNAUTHORIZED"));
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRefreshToken(InvalidRefreshTokenException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(ex.getMessage(), "INVALID_REFRESH_TOKEN", 401, "UNAUTHORIZED"));
    }

    // ── Affiliate ─────────────────────────────────────────────────────────────

    @ExceptionHandler(AffiliateAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleAffiliateAlreadyExists(AffiliateAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(ex.getMessage(), "DOCUMENT_ALREADY_EXISTS", 409, "CONFLICT"));
    }

    @ExceptionHandler(AffiliateNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAffiliateNotFound(AffiliateNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(ex.getMessage(), "USER_NOT_FOUND", 404, "NOT_FOUND"));
    }

    // ── HTTP helpers (BadRequestException / NotFoundException) ────────────────

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(ex.getMessage(), "NOT_FOUND", 404, "NOT_FOUND"));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(ex.getMessage(), "BAD_REQUEST", 400, "BAD_REQUEST"));
    }

    // ── Validation ────────────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of("Invalid input data", "INVALID_INPUT", 400, "BAD_REQUEST"));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFound(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of("Resource not found", "NOT_FOUND", 404, "NOT_FOUND"));
    }

    // ── Fallback ──────────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("Internal server error", "INTERNAL_SERVER_ERROR", 500, "INTERNAL_SERVER_ERROR"));
    }




    @ExceptionHandler(QuoteAlreadyProcessedException.class)
    public ResponseEntity<ErrorResponse> handleQuoteAlreadyProcessed(QuoteAlreadyProcessedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(ex.getMessage(), "QUOTE_ALREADY_PROCESSED", 409, "CONFLICT"));
    }

}
