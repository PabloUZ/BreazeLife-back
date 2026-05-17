package com.highdev.breazelife.modules.fund.controller;

import com.highdev.breazelife.modules.fund.dto.request.RechargeFundRequest;
import com.highdev.breazelife.modules.fund.dto.response.ApiResponse;
import com.highdev.breazelife.modules.fund.dto.response.FundResponse;
import com.highdev.breazelife.modules.fund.dto.response.MovementPageResponse;
import com.highdev.breazelife.modules.fund.enums.FundType;
import com.highdev.breazelife.modules.fund.service.FundsService;
import com.highdev.breazelife.modules.user.entity.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/employers/{employer_id}/funds")
@RequiredArgsConstructor
public class FundsController {

    private final FundsService fundsService;

    private void validateOwnership(String requestedEmployerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        //si es ADMIN, tiene pase libre
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().contains("ADMIN"))) {
            return;
        }

        //extraemos el objeto User completo del Token y obtenemos su ID real
        User currentUser = (User) auth.getPrincipal();
        String currentUserId = currentUser.getId().toString(); 

        // System.out.println("ID de la URL: " + requestedEmployerId);
        // System.out.println("ID del Token extraido: " + currentUserId);

        if (!requestedEmployerId.equals(currentUserId)) {
            throw new AccessDeniedException("Acceso denegado: No tienes permiso para acceder a los fondos de otra empresa.");
        }
    }

    @PostMapping("/initialize")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<ApiResponse<String>> initializeFunds(
            @PathVariable("employer_id") String employerId) {
        
        fundsService.initializeFunds(employerId);
        
        return ResponseEntity.status(201).body(
            ApiResponse.success("Funds initialized successfully", 201, "CREATED", "Employer ID: " + employerId)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<ApiResponse<List<FundResponse>>> getFunds(@PathVariable("employer_id") String employerId) {
        
        validateOwnership(employerId); // Validamos identidad
        List<FundResponse> data = fundsService.getFunds(employerId);
        return ResponseEntity.ok(ApiResponse.success("Funds retrieved successfully", 200, "OK", data));
    }

    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @GetMapping("/{fund_type}")
    public ResponseEntity<ApiResponse<FundResponse>> getFundByType(
            @PathVariable("employer_id") String employerId,
            @PathVariable("fund_type") FundType fundType) {

        validateOwnership(employerId);
        FundResponse data = fundsService.getFundByType(employerId, fundType);
        return ResponseEntity.ok(ApiResponse.success("Fund retrieved successfully", 200, "OK", data));
    }

    @PostMapping("/{fund_type}/recharge")
    @PreAuthorize("hasAnyRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<FundResponse>> rechargeFund(
            @PathVariable("employer_id") String employerId,
            @PathVariable("fund_type") FundType fundType,
            @Valid @RequestBody RechargeFundRequest request) {

        validateOwnership(employerId);

        FundResponse data = fundsService.rechargeFund(employerId, fundType, request);
        return ResponseEntity.ok(ApiResponse.success("Fund recharged successfully", 200, "OK", data));
    }


    @GetMapping("/{fund_type}/movements")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<ApiResponse<MovementPageResponse>> getFundMovements(
            @PathVariable("employer_id") String employerId,
            @PathVariable("fund_type") FundType fundType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        validateOwnership(employerId);

        MovementPageResponse data = fundsService.getFundMovements(
            employerId, fundType, from, to, page, limit);
        return ResponseEntity.ok(
            ApiResponse.success("Movements retrieved successfully", 200, "OK", data));
    }
    

    
}