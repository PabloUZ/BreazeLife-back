package com.highdev.breazelife.shared.handlers;

import com.highdev.breazelife.common.exceptions.http.BadRequestException;
import com.highdev.breazelife.common.exceptions.http.ConflictException;
import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.common.exceptions.http.UnauthorizedException;
import com.highdev.breazelife.modules.affiliate.exceptions.AffiliateAlreadyExistsException;
import com.highdev.breazelife.modules.auth.exception.InvalidCredentialsException;
import com.highdev.breazelife.modules.notification.exceptions.ForbiddenNotificationException;
import com.highdev.breazelife.modules.notification.exceptions.NotificationNotFoundException;
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
import com.highdev.breazelife.modules.quote.exceptions.InvalidDateRangeException;

import java.util.Map;
import java.util.stream.Collectors;
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

    // ── Notification ──────────────────────────────────────────────────────────

    @ExceptionHandler(NotificationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotificationNotFound(NotificationNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(ex.getMessage(), "NOTIFICATION_NOT_FOUND", 404, "NOT_FOUND"));
    }

    @ExceptionHandler(ForbiddenNotificationException.class)
    public ResponseEntity<ErrorResponse> handleForbiddenNotification(ForbiddenNotificationException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.of(ex.getMessage(), "FORBIDDEN_NOTIFICATION", 403, "FORBIDDEN"));
    }

    // ── HTTP helpers (BadRequestException / NotFoundException / ConflictException / UnauthorizedException) ──

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(ex.getMessage(), ex.getCode(), 404, "NOT_FOUND"));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(ex.getMessage(), ex.getCode(), 400, "BAD_REQUEST"));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(ex.getMessage(), ex.getCode(), 409, "CONFLICT"));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(ex.getMessage(), ex.getCode(), 401, "UNAUTHORIZED"));
    }

    // ── Validation ────────────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> details = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        fe -> toSnakeCase(fe.getField()),
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "invalid value",
                        (first, second) -> first
                ));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of("Invalid input data", "INVALID_INPUT", 400, "BAD_REQUEST", details));
    }

    private String toSnakeCase(String camelCase) {
        return camelCase.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
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

    @ExceptionHandler(InvalidDateRangeException.class)
    public ResponseEntity<ErrorResponse> handleInvalidDateRange(InvalidDateRangeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(ex.getMessage(), "INVALID_DATE_RANGE", 400, "BAD_REQUEST"));
    }

}
