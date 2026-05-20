package com.highdev.breazelife.modules.payment.controller;

import com.highdev.breazelife.modules.payment.dto.request.ExecutePayrollRequest;
import com.highdev.breazelife.modules.payment.dto.request.PayrollPreviewRequest;
import com.highdev.breazelife.modules.payment.dto.response.ExecutePayrollResponse;
import com.highdev.breazelife.modules.payment.dto.response.PayrollPreviewResponse;
import com.highdev.breazelife.modules.payment.service.PayrollService;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payroll")
@PreAuthorize("hasRole('EMPLOYER')")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<PayrollPreviewResponse>> previewPayroll(
        @AuthenticationPrincipal User user,
        @RequestHeader(value = "X-Employer-Id", required = false) String headerEmployerId,
        @Valid @RequestBody PayrollPreviewRequest request) {

        String employerUserId = user != null ? user.getId() : headerEmployerId;
        if (employerUserId == null || employerUserId.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        PayrollPreviewResponse data = payrollService.preview(employerUserId, request);
        return ResponseEntity.ok(ApiResponse.of("Payroll preview generated successfully", 200, "OK", data));
    }

    @PostMapping("/execute")
    public ResponseEntity<ApiResponse<ExecutePayrollResponse>> executePayroll(
        @AuthenticationPrincipal User user,
        @RequestHeader(value = "X-Employer-Id", required = false) String headerEmployerId,
        @Valid @RequestBody ExecutePayrollRequest request) {

        String employerUserId = user != null ? user.getId() : headerEmployerId;
        if (employerUserId == null || employerUserId.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ExecutePayrollResponse data = payrollService.execute(employerUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.of("Payroll executed successfully", 201, "CREATED", data));
    }
}