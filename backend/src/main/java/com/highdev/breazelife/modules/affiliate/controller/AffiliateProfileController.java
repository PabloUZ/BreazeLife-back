package com.highdev.breazelife.modules.affiliate.controller;

import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.modules.affiliate.dto.response.AffiliateProfileResponseDTO;
import com.highdev.breazelife.modules.affiliate.service.AffiliateService;
import com.highdev.breazelife.modules.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/affiliate")
public class AffiliateProfileController {

    @Autowired
    private AffiliateService affiliateService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        String affiliateId = extractAffiliateId();
        try {
            AffiliateProfileResponseDTO profile = affiliateService.getProfile(affiliateId);
            return ResponseEntity.ok(Map.of(
                    "message", "Profile retrieved successfully",
                    "status_code", 200,
                    "status", "OK",
                    "data", profile
            ));
        } catch (NotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new NotFoundException("ACCOUNT_NOT_FOUND", "Pension account not found for this affiliate");
        }
    }

    private String extractAffiliateId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            return "test-affiliate-id";
        }
        return user.getId();
    }
}
