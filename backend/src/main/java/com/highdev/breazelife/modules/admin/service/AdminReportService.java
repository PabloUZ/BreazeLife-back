package com.highdev.breazelife.modules.admin.service;

import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.account.repository.AccountRepository;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.affiliate.repository.AffiliateRepository;
import com.highdev.breazelife.modules.document.service.PdfTemplateService;
import com.highdev.breazelife.modules.quote.entity.Quote;
import com.highdev.breazelife.modules.quote.repository.QuoteRepository;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AdminReportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final QuoteRepository quoteRepository;
    private final AffiliateRepository affiliateRepository;
    private final AccountRepository accountRepository;
    private final PdfTemplateService pdfTemplateService;

    public AdminReportService(QuoteRepository quoteRepository,
                               AffiliateRepository affiliateRepository,
                               AccountRepository accountRepository,
                               PdfTemplateService pdfTemplateService) {
        this.quoteRepository = quoteRepository;
        this.affiliateRepository = affiliateRepository;
        this.accountRepository = accountRepository;
        this.pdfTemplateService = pdfTemplateService;
    }

    // ── Reporte de Cotizaciones ───────────────────────────────────────────────

    public byte[] generateQuotesReport(LocalDate from, LocalDate to) {
        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt = to.atTime(23, 59, 59);

        List<Quote> quotes = quoteRepository.findAllByDateRange(fromDt, toDt);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = pdfTemplateService.createDocument(out);

        pdfTemplateService.addHeader(doc, "Reporte Global de Cotizaciones");

        // Rango del reporte
        pdfTemplateService.addSectionTitle(doc, "Período del reporte");
        Table rangeTable = pdfTemplateService.createDataTable();
        pdfTemplateService.addTableRow(rangeTable, "Fecha inicial", from.format(DATE_FMT), true);
        pdfTemplateService.addTableRow(rangeTable, "Fecha final", to.format(DATE_FMT), false);
        pdfTemplateService.addTableRow(rangeTable, "Total cotizaciones encontradas", String.valueOf(quotes.size()), true);
        doc.add(rangeTable);

        // Resumen por estado
        long accepted  = quotes.stream().filter(q -> q.getStatus() == Quote.QuoteStatus.ACCEPTED).count();
        long pending   = quotes.stream().filter(q -> q.getStatus() == Quote.QuoteStatus.PENDING).count();
        long rejected  = quotes.stream().filter(q -> q.getStatus() == Quote.QuoteStatus.REJECTED).count();
        BigDecimal totalContrib = quotes.stream()
                .filter(q -> q.getStatus() == Quote.QuoteStatus.ACCEPTED)
                .map(q -> q.getEmployerContrib().add(q.getAffiliateContrib()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        pdfTemplateService.addSectionTitle(doc, "Resumen");
        Table summaryTable = pdfTemplateService.createDataTable();
        pdfTemplateService.addTableRow(summaryTable, "Aceptadas",  String.valueOf(accepted),  true);
        pdfTemplateService.addTableRow(summaryTable, "Pendientes", String.valueOf(pending),   false);
        pdfTemplateService.addTableRow(summaryTable, "Rechazadas", String.valueOf(rejected),  true);
        pdfTemplateService.addTableRow(summaryTable, "Total aportado (aceptadas)", formatCurrency(totalContrib), false);
        doc.add(summaryTable);

        // Detalle de cotizaciones
        pdfTemplateService.addSectionTitle(doc, "Detalle de cotizaciones");

        if (quotes.isEmpty()) {
            doc.add(new Paragraph("No se encontraron cotizaciones en el período seleccionado.")
                    .setFontSize(10).setItalic());
        } else {
            Table table = new Table(UnitValue.createPercentArray(new float[]{14, 22, 14, 14, 10, 12, 14}))
                    .setWidth(UnitValue.createPercentValue(100));

            pdfTemplateService.addTableHeaderRow(table,
                    "ID Cotización", "Afiliado", "Aporte Empleador", "Aporte Afiliado",
                    "Días", "Fecha", "Estado");

            for (int i = 0; i < quotes.size(); i++) {
                Quote q = quotes.get(i);
                String affiliateName = "";
                if (q.getAccount() != null && q.getAccount().getAffiliate() != null
                        && q.getAccount().getAffiliate().getUser() != null) {
                    var user = q.getAccount().getAffiliate().getUser();
                    affiliateName = user.getFirstName() + " " + user.getLastName();
                }
                pdfTemplateService.addMovementRow(table, i % 2 == 0,
                        q.getId(),
                        affiliateName,
                        formatCurrency(q.getEmployerContrib()),
                        formatCurrency(q.getAffiliateContrib()),
                        String.valueOf(q.getDaysContributed() != null ? q.getDaysContributed() : 0),
                        q.getContribDate() != null ? q.getContribDate().format(DATETIME_FMT) : "—",
                        q.getStatus().name()
                );
            }
            doc.add(table);
        }

        pdfTemplateService.addFooter(doc);
        doc.close();
        return out.toByteArray();
    }

    // ── Reporte de Afiliados ──────────────────────────────────────────────────

    public byte[] generateAffiliatesReport(LocalDate from, LocalDate to) {
        List<Affiliate> affiliates = (from != null && to != null)
                ? affiliateRepository.findByAffiliationDateBetweenOrderByAffiliationDateAsc(from, to)
                : affiliateRepository.findAllByOrderByAffiliationDateAsc();

        List<Account> accounts = accountRepository.findAll();

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // ── Documento en horizontal (A4 Landscape) para acomodar todas las columnas
        PdfWriter writer  = new PdfWriter(out);
        PdfDocument pdf   = new PdfDocument(writer);
        Document doc      = new Document(pdf, PageSize.A4.rotate());
        doc.setMargins(35, 45, 50, 45);

        pdfTemplateService.addHeader(doc, "Reporte Global de Afiliados");

        // Rango del reporte
        pdfTemplateService.addSectionTitle(doc, "Período del reporte");
        Table rangeTable = pdfTemplateService.createDataTable();
        if (from != null && to != null) {
            pdfTemplateService.addTableRow(rangeTable, "Fecha inicial",  from.format(DATE_FMT), true);
            pdfTemplateService.addTableRow(rangeTable, "Fecha final",    to.format(DATE_FMT),  false);
        } else {
            pdfTemplateService.addTableRow(rangeTable, "Período", "Todos los registros", true);
        }
        pdfTemplateService.addTableRow(rangeTable, "Total afiliados encontrados", String.valueOf(affiliates.size()), false);
        doc.add(rangeTable);

        // Resumen por estado
        long active    = affiliates.stream().filter(a -> a.getStatus() == Affiliate.Status.ACTIVE).count();
        long suspended = affiliates.stream().filter(a -> a.getStatus() == Affiliate.Status.SUSPENDED).count();
        long inactive  = affiliates.stream().filter(a -> a.getStatus() == Affiliate.Status.INACTIVE).count();

        pdfTemplateService.addSectionTitle(doc, "Resumen");
        Table summaryTable = pdfTemplateService.createDataTable();
        pdfTemplateService.addTableRow(summaryTable, "Activos",     String.valueOf(active),    true);
        pdfTemplateService.addTableRow(summaryTable, "Suspendidos", String.valueOf(suspended), false);
        pdfTemplateService.addTableRow(summaryTable, "Inactivos",   String.valueOf(inactive),  true);
        doc.add(summaryTable);

        // Detalle de afiliados
        pdfTemplateService.addSectionTitle(doc, "Detalle de afiliados");

        if (affiliates.isEmpty()) {
            doc.add(new Paragraph("No se encontraron afiliados en el período seleccionado.")
                    .setFontSize(10).setItalic());
        } else {
            // 7 columnas con proporciones ajustadas a A4 Landscape
            // Documento | Nombre | Email | Fondo | Saldo | Estado | F.Afiliación
            float[] colWidths = {11f, 16f, 22f, 11f, 13f, 10f, 11f};
            Table table = new Table(UnitValue.createPercentArray(colWidths))
                    .setWidth(UnitValue.createPercentValue(100));

            addAffiliateHeaderRow(table,
                    "Documento", "Nombre completo", "Email",
                    "Tipo fondo", "Saldo", "Estado", "F. Afiliación");

            for (int i = 0; i < affiliates.size(); i++) {
                Affiliate a    = affiliates.get(i);
                String name    = a.getUser() != null
                        ? a.getUser().getFirstName() + " " + a.getUser().getLastName() : "—";
                String email   = a.getUser() != null ? a.getUser().getEmail() : "—";
                Account account = accounts.stream()
                        .filter(acc -> acc.getAffiliate() != null
                                && a.getUserId().equals(acc.getAffiliate().getUserId()))
                        .findFirst().orElse(null);
                String fundType = account != null && account.getAccountType() != null
                        ? account.getAccountType().name() : "—";
                String balance  = account != null && account.getBalance() != null
                        ? formatCurrency(account.getBalance()) : "—";

                addAffiliateDataRow(table, i % 2 == 0,
                        a.getDocument(), name, email, fundType, balance,
                        a.getStatus().name(),
                        a.getAffiliationDate() != null ? a.getAffiliationDate().format(DATE_FMT) : "—");
            }
            doc.add(table);
        }

        pdfTemplateService.addFooter(doc);
        doc.close();
        return out.toByteArray();
    }

    // Encabezado de tabla de afiliados optimizado para landscape
    private void addAffiliateHeaderRow(Table table, String... headers) {
        DeviceRgb COLOR_BLUE = new DeviceRgb(0, 102, 204);
        for (String h : headers) {
            table.addHeaderCell(new Cell()
                    .setBackgroundColor(COLOR_BLUE)
                    .setBorder(Border.NO_BORDER)
                    .setPadding(5)
                    .add(new Paragraph(h)
                            .setFontColor(ColorConstants.WHITE)
                            .setBold()
                            .setFontSize(8)
                            .setTextAlignment(TextAlignment.CENTER)));
        }
    }

    // Fila de datos de tabla de afiliados con font pequeño para que quepa
    private void addAffiliateDataRow(Table table, boolean isEven, String... values) {
        DeviceRgb COLOR_LIGHT  = new DeviceRgb(240, 245, 255);
        DeviceRgb COLOR_BORDER = new DeviceRgb(200, 210, 230);
        var bg = isEven ? COLOR_LIGHT : ColorConstants.WHITE;
        for (String v : values) {
            table.addCell(new Cell()
                    .setBackgroundColor(bg)
                    .setBorder(new SolidBorder(COLOR_BORDER, 0.3f))
                    .setPadding(4)
                    .add(new Paragraph(v != null ? v : "—")
                            .setFontSize(7.5f)));
        }
    }

    // ── Utilidades ────────────────────────────────────────────────────────────

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "—";
        return "$" + String.format("%,.2f", amount);
    }
}

