package com.highdev.breazelife.modules.document.entity;

import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.payment.entity.Payment;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "employer_documents")
public class EmployerDocument {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    @ManyToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Enumerated(EnumType.STRING)
    private DocumentType type;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_path", columnDefinition = "TEXT")
    private String filePath;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    public enum DocumentType {
        PAYROLL_RECEIPT, PAYSLIP
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Employer getEmployer() { return employer; }
    public void setEmployer(Employer employer) { this.employer = employer; }

    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }

    public DocumentType getType() { return type; }
    public void setType(DocumentType type) { this.type = type; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
