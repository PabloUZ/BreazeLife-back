package com.highdev.breazelife.modules.document.dto.request;

import com.highdev.breazelife.modules.document.entity.AffiliateDocument.DocumentType;
import jakarta.validation.constraints.NotNull;

/**
 * Payload para generar un certificado PDF.
 *
 * type: tipo de documento a generar
 *   AFFILIATION_CERTIFICATE → certificado de afiliación
 *   BALANCE_CERTIFICATE     → certificado de saldo
 *   ACCOUNT_STATEMENT       → extracto de cuenta (requiere fromDate y toDate)
 *
 * fromDate / toDate: solo requeridos para ACCOUNT_STATEMENT (formato YYYY-MM-DD)
 */
public record GenerateCertificateRequest(

    @NotNull(message = "Document type is required")
    DocumentType type,

    String fromDate,

    String toDate
) {}