package com.highdev.breazelife.modules.account.controller;

import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.account.service.AccountService;
import com.highdev.breazelife.modules.fund.dto.response.ApiResponse; // Reutiliza tu clase estándar de respuestas
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping("/initialize/{affiliate_user_id}")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<ApiResponse<String>> initializeAccount(
            @PathVariable("affiliate_user_id") String affiliateUserId) {
        
        Account account = accountService.createAccountForAffiliate(affiliateUserId);
        
        return ResponseEntity.status(201).body(
            ApiResponse.success("Account initialized successfully", 201, "CREATED", "Account ID: " + account.getId())
        );
    }
}