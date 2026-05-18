package com.highdev.breazelife.modules.document.dto.response;

import com.highdev.breazelife.modules.document.entity.AffiliateDocument.DocumentType;

import java.time.LocalDateTime;

/**
 * Respuesta al listar o generar un documento.
 * No incluye el contenido binario del PDF — solo metadata.
 * Para descargar el archivo usar el endpoint indicado en downloadUrl.
 */
public record DocumentResponse(
    String documentId,
    DocumentType type,
    String fileName,
    LocalDateTime generatedAt,
    String downloadUrl
) {}