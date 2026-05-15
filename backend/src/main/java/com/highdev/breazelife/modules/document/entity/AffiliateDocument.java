package com.highdev.breazelife.modules.document.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "affiliate_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AffiliateDocument {

    @Id
    @Column(name = "id", length = 20)
    private String id;

    @Column(name = "affiliate_id", nullable = false, length = 36)
    private String affiliateId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private DocumentType type;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Lob
    @Column(name = "content", nullable = false)
    private byte[] content;

    @CreationTimestamp
    @Column(name = "generated_at", nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    public enum DocumentType {
        AFFILIATION_CERTIFICATE,
        BALANCE_CERTIFICATE,
        ACCOUNT_STATEMENT,
        PAYSLIP
    }
}