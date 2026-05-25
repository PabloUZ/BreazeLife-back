package com.highdev.breazelife.modules.account.controller;

import com.highdev.breazelife.modules.account.service.AccumulationService;
import com.highdev.breazelife.modules.fund.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/accumulations")
@RequiredArgsConstructor
public class AccountAccumulationController {

    private final AccumulationService accumulationService;

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<String>> processAccumulation(
            @RequestParam("affiliate_id") String affiliateId,
            @RequestParam("quote_id") String quoteId) {
        
        accumulationService.processAccumulation(affiliateId, quoteId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Aporte capitalizado y acumulado en la cuenta exitosamente", 200, "OK", null)
        );
    }
}