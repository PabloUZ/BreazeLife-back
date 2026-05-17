package com.highdev.breazelife.modules.fund.controller;

import com.highdev.breazelife.modules.fund.dto.request.RechargeFundRequest;
import com.highdev.breazelife.modules.fund.dto.response.ApiResponse;
import com.highdev.breazelife.modules.fund.dto.response.FundResponse;
import com.highdev.breazelife.modules.fund.enums.FundType;
import com.highdev.breazelife.modules.fund.service.FundsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employers/{employer_id}/funds")
@PreAuthorize("hasRole('EMPLOYER')")
@RequiredArgsConstructor
public class FundsController {

    private final FundsService fundsService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FundResponse>>> getFunds(@PathVariable("employer_id") String employerId) {
        List<FundResponse> data = fundsService.getFunds(employerId);
        return ResponseEntity.ok(ApiResponse.success("Funds retrieved successfully", 200, "OK", data));
    }

    @GetMapping("/{fund_type}")
    public ResponseEntity<ApiResponse<FundResponse>> getFundByType(
            @PathVariable("employer_id") String employerId,
            @PathVariable("fund_type") FundType fundType) {
        FundResponse data = fundsService.getFundByType(employerId, fundType);
        return ResponseEntity.ok(ApiResponse.success("Fund retrieved successfully", 200, "OK", data));
    }

    @PostMapping("/{fund_type}/recharge")
    public ResponseEntity<ApiResponse<FundResponse>> rechargeFund(
            @PathVariable("employer_id") String employerId,
            @PathVariable("fund_type") FundType fundType,
            @Valid @RequestBody RechargeFundRequest request) {
        FundResponse data = fundsService.rechargeFund(employerId, fundType, request);
        return ResponseEntity.ok(ApiResponse.success("Fund recharged successfully", 200, "OK", data));
    }
}