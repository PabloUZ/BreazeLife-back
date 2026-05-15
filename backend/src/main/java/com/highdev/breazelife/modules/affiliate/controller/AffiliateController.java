package com.highdev.breazelife.modules.affiliate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.common.exceptions.http.BadRequestException;

import com.highdev.breazelife.modules.quote.dto.response.PagedResponseDTO;
import com.highdev.breazelife.modules.quote.dto.response.QuoteResponseDTO;

import com.highdev.breazelife.modules.affiliate.exceptions.AffiliateNotFoundException;
import com.highdev.breazelife.modules.quote.exceptions.InvalidDateRangeException;

import com.highdev.breazelife.modules.affiliate.dto.response.AffiliateProfileResponseDTO;
import com.highdev.breazelife.modules.affiliate.service.AffiliateService;

// Importación corregida al módulo quote
import com.highdev.breazelife.modules.quote.entity.Quote;

import com.highdev.breazelife.modules.affiliate.exceptions.AffiliateAlreadyExistsException;

import com.highdev.breazelife.modules.affiliate.dto.request.AffiliateRequestDTO;

@RestController
@RequestMapping("/api/v1/affiliates")
public class AffiliateController {

    @Autowired
    private AffiliateService affiliateService;

    @GetMapping("/{affiliate_id}/profile")
    public ResponseEntity<?> getProfile(@PathVariable("affiliate_id") String affiliateId) {
        try {
            AffiliateProfileResponseDTO profile = affiliateService.getProfile(affiliateId);
            return ResponseEntity.ok(Map.of(
                    "message", "Profile retrieved successfully",
                    "status_code", 200,
                    "status", "OK",
                    "data", profile
            ));
        } catch (AffiliateNotFoundException e) {
            throw new NotFoundException("AFFILIATE_NOT_FOUND", e.getMessage());
        }
    }

    @GetMapping("/{affiliate_id}/quotes")
    public ResponseEntity<?> getQuoteHistory(
            @PathVariable("affiliate_id") String affiliateId,
            @RequestParam(required = false) Quote.QuoteStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            PagedResponseDTO<QuoteResponseDTO> result = affiliateService.getQuoteHistory(
                    affiliateId, status, from, to, page, size
            );
            return ResponseEntity.ok(Map.of(
                    "message", "Quotes retrieved successfully",
                    "status_code", 200,
                    "status", "OK",
                    "data", result
            ));
        } catch (InvalidDateRangeException e) {
            throw new BadRequestException("INVALID_DATE_RANGE", e.getMessage());
        } catch (AffiliateNotFoundException e) {
            throw new NotFoundException("AFFILIATE_NOT_FOUND", e.getMessage());
        }
    }


    @PostMapping("/register")
    public ResponseEntity<?> registerAffiliate(@RequestBody AffiliateRequestDTO dto) {
        try {
            affiliateService.saveAffiliate(dto);
            return ResponseEntity.status(201).body(Map.of(
                "message", "Affiliate registered successfully",
                "status_code", 201,
                "status", "CREATED"
            ));
        } catch (AffiliateAlreadyExistsException e) {
            // Este catch es opcional si ya configuraste el GlobalExceptionHandler
            throw new BadRequestException("DUPLICATE_DOCUMENT", e.getMessage());
        }
    }
}