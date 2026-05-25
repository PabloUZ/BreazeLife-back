package com.highdev.breazelife.modules.document.controller;

import com.highdev.breazelife.modules.affiliate.dto.response.AffiliateProfileResponseDTO;
import com.highdev.breazelife.modules.affiliate.service.AffiliateService;
import com.highdev.breazelife.modules.document.dto.request.GenerateCertificateRequest;
import com.highdev.breazelife.modules.document.dto.response.DocumentResponse;
import com.highdev.breazelife.modules.document.service.AffiliateDocumentService;
import com.highdev.breazelife.modules.document.service.AffiliateDocumentService.AffiliateData;
import com.highdev.breazelife.modules.document.service.AffiliateDocumentService.PayslipData;
import com.highdev.breazelife.modules.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/affiliates/documents")
@PreAuthorize("hasRole('AFFILIATE')")
@RequiredArgsConstructor
@Tag(name = "Affiliate Documents", description = "PDF document generation and download for affiliates")
public class AffiliateDocumentController {

    private final AffiliateDocumentService documentService;
    private final AffiliateService affiliateService;

    // ── GET /api/v1/affiliates/documents ──────────────────────────────────────

    @GetMapping
    @Operation(summary = "List affiliate documents")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Documents listed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> getDocuments(
        @AuthenticationPrincipal User user) {
        List<DocumentResponse> documents = documentService.getDocuments(user.getId());
        return ResponseEntity.ok(Map.of(
            "message", "Documents retrieved successfully",
            "status_code", 200,
            "status", "OK",
            "data", Map.of("items", documents)
        ));
    }

    // ── POST /api/v1/affiliates/documents/certificate ─────────────────────────

    @PostMapping("/certificate")
    @Operation(summary = "Generate affiliate certificate",
        description = "Type: AFFILIATION_CERTIFICATE | BALANCE_CERTIFICATE | ACCOUNT_STATEMENT. " +
            "fromDate and toDate required only for ACCOUNT_STATEMENT.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Certificate generated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> generateCertificate(
        @AuthenticationPrincipal User user,
        @Valid @RequestBody GenerateCertificateRequest request) {

        AffiliateData data = buildAffiliateData(user.getId());
        DocumentResponse result = documentService.generateCertificate(
            user.getId(), request, data);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Certificate generated successfully",
            "status_code", 201,
            "status", "CREATED",
            "data", result
        ));
    }

    // ── GET /api/v1/affiliates/documents/payslips ─────────────────────────────

    @GetMapping("/payslips")
    @Operation(summary = "List affiliate payslip history")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Payslips listed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> getPayslips(
        @AuthenticationPrincipal User user) {
        List<DocumentResponse> payslips = documentService.getPayslips(user.getId());
        return ResponseEntity.ok(Map.of(
            "message", "Payslips retrieved successfully",
            "status_code", 200,
            "status", "OK",
            "data", Map.of("items", payslips)
        ));
    }

    // ── POST /api/v1/affiliates/documents/payslips ────────────────────────────

    @PostMapping("/payslips")
    @Operation(summary = "Generate affiliate payslip PDF",
        description = "Generates a payslip PDF. TODO: connect with real payment data in Sprint 2.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Payslip generated successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> generatePayslip(
        @AuthenticationPrincipal User user) {

        PayslipData data = buildPayslipData(user.getId());
        DocumentResponse result = documentService.generatePayslip(user.getId(), data);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Payslip generated successfully",
            "status_code", 201,
            "status", "CREATED",
            "data", result
        ));
    }

    // ── GET /api/v1/affiliates/documents/{document_id}/download ──────────────

    @GetMapping("/{document_id}/download")
    @Operation(summary = "Download affiliate document PDF")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "PDF returned successfully"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<byte[]> downloadDocument(
        @AuthenticationPrincipal User user,
        @PathVariable("document_id") String documentId) {

        byte[] pdfBytes = documentService.downloadDocument(documentId, user.getId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", documentId + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    // ── Helpers privados ──────────────────────────────────────────────────────

    // TODO Sprint 2: usar datos reales de accounts
    private AffiliateData buildAffiliateData(String affiliateId) {
        AffiliateProfileResponseDTO profile = affiliateService.getProfile(affiliateId);

        return new AffiliateData(
            profile.firstName(),
            profile.lastName(),
            profile.document(),
            profile.birthDate(),
            profile.affiliationDate(),
            profile.account() != null ? profile.account().accountType() : null,
            profile.account() != null && profile.account().balance() != null
                ? profile.account().balance().doubleValue() : 0.0,
            profile.account() != null && profile.account().quotedDays() != null
                ? profile.account().quotedDays() : 0,
            List.of(),
            List.of()
        );
    }

    // TODO Sprint 2: usar datos reales de contracts
    private PayslipData buildPayslipData(String affiliateId) {
        AffiliateProfileResponseDTO profile = affiliateService.getProfile(affiliateId);

        return new PayslipData(
            profile.firstName(),
            profile.lastName(),
            profile.document(),
            "—",           // cargo → disponible en Sprint 2 desde contracts
            "—",           // empresa → disponible en Sprint 2 desde contracts
            java.time.LocalDate.now().getMonthValue(),
            java.time.LocalDate.now().getYear(),
            0.0,           // grossSalary → disponible en Sprint 2
            0.0,           // netSalary → disponible en Sprint 2
            0.0,           // employerContrib → disponible en Sprint 2
            0.0,           // totalContrib → disponible en Sprint 2
            "PENDIENTE"
        );
    }
}