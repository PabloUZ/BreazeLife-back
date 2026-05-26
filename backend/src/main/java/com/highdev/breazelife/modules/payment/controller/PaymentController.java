package com.highdev.breazelife.modules.payment.controller;

import com.highdev.breazelife.modules.payment.dto.response.AffiliatePaymentHistoryResponse;
import com.highdev.breazelife.modules.payment.dto.response.PaymentDetailResponse;
import com.highdev.breazelife.modules.payment.service.PayrollService;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.shared.dto.ApiResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/payroll/payments")
public class PaymentController {

    private final PayrollService payrollService;

    public PaymentController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping("/{payment_id}")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('AFFILIATE')")
    public ResponseEntity<ApiResponse<PaymentDetailResponse>> getPaymentDetail(
        @AuthenticationPrincipal User user,
        @PathVariable("payment_id") String paymentId) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        PaymentDetailResponse data = payrollService.getPaymentDetail(
            user.getId(), user.getRole().name(), paymentId);
        return ResponseEntity.ok(ApiResponse.of("Payment detail retrieved successfully", 200, "OK", data));
    }

    @GetMapping
    @PreAuthorize("hasRole('AFFILIATE')")
    public ResponseEntity<ApiResponse<AffiliatePaymentHistoryResponse>> getAffiliatePayments(
        @AuthenticationPrincipal User user,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int limit,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        @RequestParam(required = false) String status) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AffiliatePaymentHistoryResponse data = payrollService.getAffiliatePayments(
            user.getId(), page, limit, from, to, status);
        return ResponseEntity.ok(ApiResponse.of("Payment history retrieved successfully", 200, "OK", data));
    }
}
