package com.highdev.breazelife.modules.affiliate.controller;

import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.modules.affiliate.dto.response.AffiliateDashboardResponseDTO;
import com.highdev.breazelife.modules.affiliate.service.AffiliateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/affiliate")
public class AffiliateProfileController {

    @Autowired
    private AffiliateService affiliateService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        String affiliateId = extractAffiliateId(userDetails);
        try {
            AffiliateDashboardResponseDTO dashboard = affiliateService.getDashboard(affiliateId);
            return ResponseEntity.ok(Map.of(
                    "message", "Dashboard retrieved successfully",
                    "status_code", 200,
                    "status", "OK",
                    "data", dashboard
            ));
        } catch (NotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new NotFoundException("ACCOUNT_NOT_FOUND", "Pension account not found for this affiliate");
        }
    }

    // TODO: remove fallback when Module 1 (auth) is complete
    private String extractAffiliateId(UserDetails userDetails) {
        if (userDetails == null) {
            return "test-affiliate-id";
        }
        return userDetails.getUsername();
    }
}
