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

import com.highdev.breazelife.modules.affiliate.service.AffiliateService;

// Importación corregida al módulo quote
import com.highdev.breazelife.modules.quote.entity.Quote;

import com.highdev.breazelife.modules.affiliate.exceptions.AffiliateAlreadyExistsException;

import com.highdev.breazelife.modules.affiliate.dto.request.AffiliateRequestDTO;
import org.springframework.security.access.prepost.PreAuthorize;

import com.highdev.breazelife.modules.account.service.AccumulationService; // Asegúrate de la ruta
import com.highdev.breazelife.modules.quote.exceptions.QuoteAlreadyProcessedException;


@RestController
@RequestMapping("/api/v1/affiliates")
public class AffiliateController {

    @Autowired
    private AffiliateService affiliateService;

    @Autowired
    private AccumulationService accumulationService; 

    @PreAuthorize("hasAnyRole('AFFILIATE', 'ADMIN')")
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


    @PreAuthorize("hasRole('ADMIN')")
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

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{affiliate_id}/quotes/{quote_id}/accumulate")
    public ResponseEntity<?> accumulateContribution(
            @PathVariable("affiliate_id") String affiliateId,
            @PathVariable("quote_id") String quoteId
    ) {
        try {
            accumulationService.processAccumulation(affiliateId, quoteId);
            return ResponseEntity.ok(Map.of(
                "message", "Contribution accumulated successfully",
                "status_code", 200,
                "status", "OK"
            ));
        } catch (QuoteAlreadyProcessedException e) {
            // qué debería de hacer, el badrequest o simplemente relanzar la excepción para que el GlobalExceptionHandler la maneje? por qué envolverlo sabeido que el GlobalExceptionHandler ya tiene un handler específico para esa excepción?
            throw e;
        } catch (NotFoundException e) {
            throw e; // Ya viene con el formato correcto desde el servicio
        }
    }
    
}