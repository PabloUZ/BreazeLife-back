package com.highdev.breazelife.modules.document.controller;

import com.highdev.breazelife.modules.document.entity.EmployerDocument;
import com.highdev.breazelife.modules.document.service.EmployerDocumentService;
import com.highdev.breazelife.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/employers/documents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EMPLOYER')")
public class EmployerDocumentController {

    private final EmployerDocumentService documentService;

    // POST /api/v1/employers/documents/payslips
    @PostMapping("/payslips")
    public ResponseEntity<EmployerDocument> createPayslip(
            @AuthenticationPrincipal User user, 
            @RequestBody Map<String, String> payload) {
        EmployerDocument doc = documentService.generateIndividualPayslip(user.getId(), payload.get("paymentId"));
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    // POST /api/v1/employers/documents/payroll-receipt
    @PostMapping("/payroll-receipt")
    public ResponseEntity<EmployerDocument> createPayrollReceipt(
            @AuthenticationPrincipal User user, 
            @RequestBody Map<String, String> payload) {
        EmployerDocument doc = documentService.generatePayrollReceipt(user.getId(), payload.get("period"));
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    // GET /api/v1/employers/documents  &&  GET /api/v1/employers/documents/history
    @GetMapping
    public ResponseEntity<Page<EmployerDocument>> getDocuments(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(documentService.getDocumentHistory(user.getId(), page, limit));
    }

    @GetMapping("/history")
    public ResponseEntity<Page<EmployerDocument>> getDocumentsHistoryAlternative(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(documentService.getDocumentHistory(user.getId(), page, limit));
    }

    // GET /api/v1/employers/documents/{document_id}
    @GetMapping("/{document_id}")
    public ResponseEntity<EmployerDocument> getDocumentMetaData(
            @AuthenticationPrincipal User user,
            @PathVariable("document_id") String docId) {
        return ResponseEntity.ok(documentService.getDocumentSecurely(docId, user.getId()));
    }

    // GET /api/v1/employers/documents/{document_id}/download
    @GetMapping("/{document_id}/download")
    public ResponseEntity<Resource> downloadDocumentPdf(
            @AuthenticationPrincipal User user,
            @PathVariable("document_id") String docId) {
        
        EmployerDocument doc = documentService.getDocumentSecurely(docId, user.getId());
        File file = new File(doc.getFilePath());

        if (!file.exists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }
}