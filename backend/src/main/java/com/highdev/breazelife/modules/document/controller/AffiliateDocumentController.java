package com.highdev.breazelife.modules.document.controller;

import com.highdev.breazelife.modules.document.dto.request.GenerateCertificateRequest;
import com.highdev.breazelife.modules.document.dto.response.DocumentResponse;
import com.highdev.breazelife.modules.document.service.AffiliateDocumentService;
import com.highdev.breazelife.modules.document.service.AffiliateDocumentService.AffiliateData;
import com.highdev.breazelife.modules.document.service.AffiliateDocumentService.PayslipData;
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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/affiliates/documents")
@PreAuthorize("hasRole('AFFILIATE')")
@RequiredArgsConstructor
@Tag(name = "Affiliate Documents", description = "PDF document generation and download for affiliates")
public class AffiliateDocumentController {

    private final AffiliateDocumentService documentService;

    @GetMapping
    @Operation(summary = "List affiliate documents")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Documents listed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> getDocuments(
        @AuthenticationPrincipal UserDetails userDetails) {
        String affiliateId = extractAffiliateId(userDetails);
        List<DocumentResponse> documents = documentService.getDocuments(affiliateId);
        return ResponseEntity.ok(Map.of(
            "message", "Documents retrieved successfully",
            "status_code", 200,
            "status", "OK",
            "data", Map.of("items", documents)
        ));
    }

    @PostMapping("/certificate")
    @Operation(summary = "Generate affiliate certificate",
        description = "Type: AFFILIATION_CERTIFICATE | BALANCE_CERTIFICATE | ACCOUNT_STATEMENT. fromDate and toDate required only for ACCOUNT_STATEMENT.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Certificate generated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> generateCertificate(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody GenerateCertificateRequest request) {
        String affiliateId = extractAffiliateId(userDetails);
        AffiliateData data = buildAffiliateData(affiliateId);
        DocumentResponse result = documentService.generateCertificate(affiliateId, request, data);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Certificate generated successfully",
            "status_code", 201,
            "status", "CREATED",
            "data", result
        ));
    }

    // ── BLIFE-15: Listar colillas ─────────────────────────────────────────────

    @GetMapping("/payslips")
    @Operation(summary = "List affiliate payslip history",
        description = "Returns all payslip PDFs previously generated for the authenticated affiliate")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Payslips listed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> getPayslips(
        @AuthenticationPrincipal UserDetails userDetails) {
        String affiliateId = extractAffiliateId(userDetails);
        List<DocumentResponse> payslips = documentService.getPayslips(affiliateId);
        return ResponseEntity.ok(Map.of(
            "message", "Payslips retrieved successfully",
            "status_code", 200,
            "status", "OK",
            "data", Map.of("items", payslips)
        ));
    }

    // ── BLIFE-15: Generar colilla ─────────────────────────────────────────────

    @PostMapping("/payslips")
    @Operation(summary = "Generate affiliate payslip PDF",
        description = "Generates a payslip PDF for the current pay period. TODO: connect with real payment data in Sprint 2.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Payslip generated successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> generatePayslip(
        @AuthenticationPrincipal UserDetails userDetails) {
        String affiliateId = extractAffiliateId(userDetails);
        PayslipData data = buildPayslipData(affiliateId);
        DocumentResponse result = documentService.generatePayslip(affiliateId, data);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Payslip generated successfully",
            "status_code", 201,
            "status", "CREATED",
            "data", result
        ));
    }

    @GetMapping("/{document_id}/download")
    @Operation(summary = "Download affiliate document PDF")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "PDF returned successfully"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<byte[]> downloadDocument(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable("document_id") String documentId) {
        String affiliateId = extractAffiliateId(userDetails);
        byte[] pdfBytes = documentService.downloadDocument(documentId, affiliateId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", documentId + ".pdf");
        headers.setContentLength(pdfBytes.length);
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    private String extractAffiliateId(UserDetails userDetails) {
        if (userDetails == null) return "test-affiliate-id";
        return userDetails.getUsername();
    }

    // MOCK — TODO: reemplazar con affiliateService + accountService (módulos 2/3)
    private AffiliateData buildAffiliateData(String affiliateId) {
        return new AffiliateData(
            "Laura", "Gómez", "1002456789",
            LocalDate.of(1995, 3, 15),
            LocalDate.of(2024, 1, 10),
            "MODERATE", 4500000.0, 210,
            List.of(), List.of()
        );
    }

    // MOCK — TODO: reemplazar con datos reales de payments/contracts/quotes (módulo 7 Sprint 2)
    private PayslipData buildPayslipData(String affiliateId) {
        return new PayslipData(
            "Laura", "Gómez", "1002456789",
            "Desarrolladora de Software",
            "Tech Corp S.A.S.",
            5, 2026,
            2000000.0, 1920000.0,
            240000.0, 320000.0,
            "PAGADO"
        );
    }
}