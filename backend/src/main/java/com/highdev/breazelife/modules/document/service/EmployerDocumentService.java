package com.highdev.breazelife.modules.document.service;

import com.highdev.breazelife.modules.document.entity.EmployerDocument;
import com.highdev.breazelife.modules.document.repository.EmployerDocumentRepository;
import com.highdev.breazelife.modules.document.util.PdfGeneratorEngine;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.payment.dto.response.PaymentDetailResponse;
import com.highdev.breazelife.modules.payment.dto.response.PayrollDetailResponse;
import com.highdev.breazelife.modules.payment.entity.Payment;
import com.highdev.breazelife.modules.payment.repository.PaymentRepository;
import com.highdev.breazelife.modules.payment.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployerDocumentService {

    private final EmployerDocumentRepository documentRepository;
    private final EmployerRepository employerRepository;
    private final PaymentRepository paymentRepository;
    private final PayrollService payrollService;
    private final PdfGeneratorEngine pdfEngine;

    private static final String STORAGE_DIR = "./storage/documents/";

    public EmployerDocument generateIndividualPayslip(String employerUserId, String paymentId) {
        Employer employer = employerRepository.findById(employerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employer not found"));
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment instance not found"));

        PaymentDetailResponse paymentData = payrollService.getPaymentDetail(employerUserId, "EMPLOYER", paymentId);
        byte[] pdfBytes = pdfEngine.generateIndividualPayslipPdf(paymentData);

        String fileName = "Payslip_" + paymentId + "_" + paymentData.getDocument() + ".pdf";
        String filePath = saveFileToDisk(fileName, pdfBytes);

        EmployerDocument doc = new EmployerDocument();
        doc.setId(UUID.randomUUID().toString());
        doc.setEmployer(employer);
        doc.setPayment(payment);
        doc.setType(EmployerDocument.DocumentType.PAYSLIP);
        doc.setFileName(fileName);
        doc.setFilePath(filePath);
        doc.setGeneratedAt(LocalDateTime.now());

        return documentRepository.save(doc);
    }

    public EmployerDocument generatePayrollReceipt(String employerUserId, String period) {
        Employer employer = employerRepository.findById(employerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employer not found"));

        PayrollDetailResponse payrollData = payrollService.getDetail(employerUserId, period);
        byte[] pdfBytes = pdfEngine.generatePayrollReceiptPdf(payrollData);

        String fileName = "PayrollReceipt_" + period + "_" + employerUserId + ".pdf";
        String filePath = saveFileToDisk(fileName, pdfBytes);

        EmployerDocument doc = new EmployerDocument();
        doc.setId(UUID.randomUUID().toString());
        doc.setEmployer(employer);
        doc.setType(EmployerDocument.DocumentType.PAYROLL_RECEIPT);
        doc.setFileName(fileName);
        doc.setFilePath(filePath);
        doc.setGeneratedAt(LocalDateTime.now());

        return documentRepository.save(doc);
    }

    public Page<EmployerDocument> getDocumentHistory(String employerUserId, int page, int limit) {
        return documentRepository.findByEmployerUserIdOrderByGeneratedAtDesc(employerUserId, PageRequest.of(page - 1, limit));
    }

    public EmployerDocument getDocumentSecurely(String id, String employerUserId) {
        return documentRepository.findByIdAndEmployerUserId(id, employerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found or access denied"));
    }

    private String saveFileToDisk(String fileName, byte[] bytes) {
        try {
            File dir = new File(STORAGE_DIR);
            if (!dir.exists()) dir.mkdirs();
            
            File file = new File(dir, fileName);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(bytes);
            }
            return file.getAbsolutePath();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to write PDF to storage disk", e);
        }
    }
}