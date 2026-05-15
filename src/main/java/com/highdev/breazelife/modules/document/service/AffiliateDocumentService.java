package com.highdev.breazelife.modules.document.service;

        import com.highdev.breazelife.modules.document.dto.request.GenerateCertificateRequest;
        import com.highdev.breazelife.modules.document.dto.response.DocumentResponse;
        import com.highdev.breazelife.modules.document.entity.AffiliateDocument;
        import com.highdev.breazelife.modules.document.entity.AffiliateDocument.DocumentType;
        import com.highdev.breazelife.modules.document.exceptions.DocumentNotFoundException;
        import com.highdev.breazelife.modules.document.repository.AffiliateDocumentRepository;
        import com.itextpdf.layout.Document;
        import com.itextpdf.layout.element.Paragraph;
        import com.itextpdf.layout.element.Table;
        import com.itextpdf.layout.properties.TextAlignment;
        import com.itextpdf.layout.properties.UnitValue;
        import lombok.RequiredArgsConstructor;
        import org.springframework.stereotype.Service;
        import org.springframework.transaction.annotation.Transactional;

        import java.io.ByteArrayOutputStream;
        import java.time.LocalDate;
        import java.time.format.DateTimeFormatter;
        import java.util.List;
        import java.util.UUID;

        /**
         * BLIFE-04-02 / BLIFE-04-04 / BLIFE-04-05
         *
         * Lógica de negocio para generación y descarga de documentos PDF del afiliado.
         *
         * Documentos soportados:
         *  - AFFILIATION_CERTIFICATE → certificado de afiliación
         *  - BALANCE_CERTIFICATE     → certificado de saldo
         *  - ACCOUNT_STATEMENT       → extracto de cuenta con historial
         */
        @Service
        @RequiredArgsConstructor
        public class AffiliateDocumentService {

        private final AffiliateDocumentRepository documentRepository;
        private final PdfTemplateService pdfTemplateService;

        private static final DateTimeFormatter DATE_FMT =
                DateTimeFormatter.ofPattern("dd/MM/yyyy");

        // ── Listar documentos ─────────────────────────────────────────────────────

        public List<DocumentResponse> getDocuments(String affiliateId) {
                return documentRepository
                        .findByAffiliateIdOrderByGeneratedAtDesc(affiliateId)
                        .stream()
                        .map(this::toResponse)
                        .toList();
        }

        // ── Generar certificado ───────────────────────────────────────────────────

        @Transactional
        public DocumentResponse generateCertificate(String affiliateId,
                                                        GenerateCertificateRequest request,
                                                        AffiliateData data) {
                byte[] pdfBytes = switch (request.type()) {
                case AFFILIATION_CERTIFICATE -> buildAffiliationCertificate(data);
                case BALANCE_CERTIFICATE     -> buildBalanceCertificate(data);
                case ACCOUNT_STATEMENT       -> buildAccountStatement(data,
                                                        request.fromDate(), request.toDate());
                default -> throw new IllegalArgumentException(
                        "Unsupported type: " + request.type());
                };

                String docId    = generateDocumentId();
                String fileName = buildFileName(request.type());

                AffiliateDocument saved = documentRepository.save(
                        AffiliateDocument.builder()
                                .id(docId)
                                .affiliateId(affiliateId)
                                .type(request.type())
                                .fileName(fileName)
                                .content(pdfBytes)
                                .build()
                );

                return toResponse(saved);
        }

        // ── Descargar PDF ─────────────────────────────────────────────────────────

        public byte[] downloadDocument(String documentId, String affiliateId) {
                return documentRepository
                        .findByIdAndAffiliateId(documentId, affiliateId)
                        .orElseThrow(() -> new DocumentNotFoundException(documentId))
                        .getContent();
        }

        // ── Construcción de PDFs ──────────────────────────────────────────────────

        /**
         * BLIFE-04-02
         * Certificado de afiliación:
         * nombre, cédula, fecha de afiliación, tipo de fondo, estado.
         */
        private byte[] buildAffiliationCertificate(AffiliateData data) {
                try {
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                Document doc = pdfTemplateService.createDocument(out);
                pdfTemplateService.addHeader(doc, "Certificado de Afiliación");

                doc.add(new Paragraph(
                        "BreazeLife S.A., Fondo de Pensiones Obligatorias, certifica que la " +
                        "siguiente persona se encuentra AFILIADA y activa en el sistema:")
                        .setFontSize(11)
                        .setTextAlignment(TextAlignment.JUSTIFIED)
                        .setMarginBottom(20));

                pdfTemplateService.addSectionTitle(doc, "Información del Afiliado");

                Table table = pdfTemplateService.createDataTable();
                pdfTemplateService.addTableRow(table, "Nombre completo",
                        data.firstName() + " " + data.lastName(), true);
                pdfTemplateService.addTableRow(table, "Número de cédula",
                        data.document(), false);
                pdfTemplateService.addTableRow(table, "Fecha de nacimiento",
                        formatDate(data.birthDate()), true);
                pdfTemplateService.addTableRow(table, "Fecha de afiliación",
                        formatDate(data.affiliationDate()), false);
                pdfTemplateService.addTableRow(table, "Tipo de fondo pensional",
                        translateAccountType(data.accountType()), true);
                pdfTemplateService.addTableRow(table, "Estado",
                        "ACTIVO", false);
                doc.add(table);

                doc.add(new Paragraph(
                        "Este certificado es válido a la fecha de su generación " +
                        "y tiene vigencia de 30 días calendario.")
                        .setFontSize(9).setItalic().setMarginTop(10));

                pdfTemplateService.addFooter(doc);
                doc.close();
                return out.toByteArray();

                } catch (Exception e) {
                throw new RuntimeException("Error generating affiliation certificate", e);
                }
        }

        /**
         * BLIFE-04-04
         * Certificado de saldo:
         * saldo acumulado a fecha de corte y semanas cotizadas.
         */
        private byte[] buildBalanceCertificate(AffiliateData data) {
                try {
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                Document doc = pdfTemplateService.createDocument(out);
                pdfTemplateService.addHeader(doc, "Certificado de Saldo Pensional");

                doc.add(new Paragraph(
                        "BreazeLife S.A. certifica que el estado de la cuenta pensional " +
                        "del afiliado a la fecha de corte es el siguiente:")
                        .setFontSize(11)
                        .setTextAlignment(TextAlignment.JUSTIFIED)
                        .setMarginBottom(20));

                pdfTemplateService.addSectionTitle(doc, "Identificación");
                Table idTable = pdfTemplateService.createDataTable();
                pdfTemplateService.addTableRow(idTable, "Nombre completo",
                        data.firstName() + " " + data.lastName(), true);
                pdfTemplateService.addTableRow(idTable, "Número de cédula",
                        data.document(), false);
                doc.add(idTable);

                pdfTemplateService.addSectionTitle(doc,
                        "Estado de Cuenta al " + LocalDate.now().format(DATE_FMT));
                Table balanceTable = pdfTemplateService.createDataTable();
                pdfTemplateService.addTableRow(balanceTable, "Saldo acumulado",
                        formatCurrency(data.balance()), true);
                pdfTemplateService.addTableRow(balanceTable, "Semanas cotizadas",
                        String.format("%.2f semanas", data.quotedDays() / 7.0), false);
                pdfTemplateService.addTableRow(balanceTable, "Semanas faltantes para pensión",
                        String.format("%.2f semanas", 1300.0 - (data.quotedDays() / 7.0)), true);
                pdfTemplateService.addTableRow(balanceTable, "Tipo de fondo",
                        translateAccountType(data.accountType()), false);
                doc.add(balanceTable);

                pdfTemplateService.addFooter(doc);
                doc.close();
                return out.toByteArray();

                } catch (Exception e) {
                throw new RuntimeException("Error generating balance certificate", e);
                }
        }

        /**
         * BLIFE-04-05
         * Extracto de cuenta:
         * historial de cotizaciones y rentabilidades por rango de fechas.
         */
        private byte[] buildAccountStatement(AffiliateData data,
                                                String fromDate, String toDate) {
                try {
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                Document doc = pdfTemplateService.createDocument(out);
                pdfTemplateService.addHeader(doc, "Extracto de Cuenta");

                String period = (fromDate != null ? fromDate : "Inicio") +
                                " — " + (toDate != null ? toDate : LocalDate.now().format(DATE_FMT));
                doc.add(new Paragraph("Período: " + period)
                        .setFontSize(11).setBold().setMarginBottom(15));

                pdfTemplateService.addSectionTitle(doc, "Identificación del Afiliado");
                Table idTable = pdfTemplateService.createDataTable();
                pdfTemplateService.addTableRow(idTable, "Nombre completo",
                        data.firstName() + " " + data.lastName(), true);
                pdfTemplateService.addTableRow(idTable, "Cédula", data.document(), false);
                pdfTemplateService.addTableRow(idTable, "Tipo de fondo",
                        translateAccountType(data.accountType()), true);
                doc.add(idTable);

                // Cotizaciones
                pdfTemplateService.addSectionTitle(doc, "Cotizaciones del Período");
                if (data.quotes() != null && !data.quotes().isEmpty()) {
                        Table quotesTable = new Table(
                                UnitValue.createPercentArray(new float[]{2, 1.5f, 1.5f, 1.5f, 1}))
                                .setWidth(UnitValue.createPercentValue(100))
                                .setMarginBottom(15);
                        pdfTemplateService.addTableHeaderRow(quotesTable,
                                "Fecha", "Aporte Empleador", "Aporte Empleado", "Total", "Estado");
                        boolean even = true;
                        for (QuoteRow q : data.quotes()) {
                        pdfTemplateService.addMovementRow(quotesTable, even,
                                q.date(),
                                formatCurrency(q.employerContrib()),
                                formatCurrency(q.affiliateContrib()),
                                formatCurrency(q.employerContrib() + q.affiliateContrib()),
                                q.status());
                        even = !even;
                        }
                        doc.add(quotesTable);
                } else {
                        doc.add(new Paragraph("No hay cotizaciones en el período seleccionado.")
                                .setFontSize(10).setItalic().setMarginBottom(10));
                }

                // Rentabilidades
                pdfTemplateService.addSectionTitle(doc, "Rentabilidades Aplicadas");
                if (data.rentabilities() != null && !data.rentabilities().isEmpty()) {
                        Table rentTable = new Table(
                                UnitValue.createPercentArray(new float[]{2, 1.5f, 1.5f}))
                                .setWidth(UnitValue.createPercentValue(100))
                                .setMarginBottom(15);
                        pdfTemplateService.addTableHeaderRow(rentTable,
                                "Fecha", "Rentabilidad", "Tipo de Fondo");
                        boolean even = true;
                        for (RentabilityRow r : data.rentabilities()) {
                        pdfTemplateService.addMovementRow(rentTable, even,
                                r.date(),
                                formatCurrency(r.profit()),
                                translateAccountType(r.accountType()));
                        even = !even;
                        }
                        doc.add(rentTable);
                } else {
                        doc.add(new Paragraph("No hay rentabilidades en el período seleccionado.")
                                .setFontSize(10).setItalic().setMarginBottom(10));
                }

                // Resumen
                pdfTemplateService.addSectionTitle(doc, "Resumen Final");
                Table summary = pdfTemplateService.createDataTable();
                pdfTemplateService.addTableRow(summary, "Saldo actual",
                        formatCurrency(data.balance()), true);
                pdfTemplateService.addTableRow(summary, "Semanas cotizadas acumuladas",
                        String.format("%.2f", data.quotedDays() / 7.0), false);
                doc.add(summary);

                pdfTemplateService.addFooter(doc);
                doc.close();
                return out.toByteArray();

                } catch (Exception e) {
                throw new RuntimeException("Error generating account statement", e);
                }
        }

        // ── Helpers ───────────────────────────────────────────────────────────────

        private String generateDocumentId() {
                return "DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        private String buildFileName(DocumentType type) {
                String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
                return switch (type) {
                case AFFILIATION_CERTIFICATE -> "certificado_afiliacion_" + date + ".pdf";
                case BALANCE_CERTIFICATE     -> "certificado_saldo_" + date + ".pdf";
                case ACCOUNT_STATEMENT       -> "extracto_cuenta_" + date + ".pdf";
                case PAYSLIP                 -> "colilla_pago_" + date + ".pdf";
                };
        }

        private String translateAccountType(String type) {
                if (type == null) return "—";
                return switch (type) {
                case "CONSERVATIVE" -> "Conservador";
                case "MODERATE"     -> "Moderado";
                case "RISKY"        -> "Mayor Riesgo";
                default             -> type;
                };
        }

        private String formatCurrency(Double amount) {
                if (amount == null) return "$ 0";
                return String.format("$ %,.0f", amount);
        }

        private String formatDate(LocalDate date) {
                return date != null ? date.format(DATE_FMT) : "—";
        }

        private DocumentResponse toResponse(AffiliateDocument doc) {
                return new DocumentResponse(
                        doc.getId(),
                        doc.getType(),
                        doc.getFileName(),
                        doc.getGeneratedAt(),
                        "/api/v1/affiliates/documents/" + doc.getId() + "/download"
                );
        }

        // ── Records de datos (usados por el Controller para pasar info al Service) ─

        /**
         * Proyección de datos del afiliado necesarios para generar los PDFs.
         * El Controller resuelve estos datos antes de llamar a generateCertificate().
         */
        public record AffiliateData(
                String firstName,
                String lastName,
                String document,
                LocalDate birthDate,
                LocalDate affiliationDate,
                String accountType,
                Double balance,
                Integer quotedDays,
                List<QuoteRow> quotes,
                List<RentabilityRow> rentabilities
        ) {}

        public record QuoteRow(
                String date,
                Double employerContrib,
                Double affiliateContrib,
                String status
        ) {}

        public record RentabilityRow(
                String date,
                Double profit,
                
                        
                String accountType
        ) {}
        }