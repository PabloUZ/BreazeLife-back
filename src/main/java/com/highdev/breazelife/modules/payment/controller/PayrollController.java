package com.highdev.breazelife.modules.payment.controller;

import com.highdev.breazelife.modules.payment.dto.request.PayrollPreviewRequest;
import com.highdev.breazelife.modules.payment.dto.response.PayrollPreviewResponse;
import com.highdev.breazelife.modules.payment.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    /**
     * POST /api/v1/payroll/preview
     * Body: { "period": "2026-05" }
     */
    @PostMapping("/preview")
    public ResponseEntity<Map<String, Object>> previewPayroll(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody PayrollPreviewRequest request) {

        String employerUserId = userDetails.getUsername();
        PayrollPreviewResponse data = payrollService.preview(employerUserId, request);

        return ResponseEntity.ok(Map.of(
            "message", "Payroll preview generated successfully",
            "status_code", 200,
            "status", "OK",
            "data", data
        ));
    }

    // POST /api/v1/payroll/execute  → sprint 2
}