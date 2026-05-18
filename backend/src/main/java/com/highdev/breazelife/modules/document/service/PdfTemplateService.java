package com.highdev.breazelife.modules.document.service;

import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;


/**
 * BLIFE-04-01 — Plantilla PDF base con encabezado oficial BreazeLife S.A.
 *
 * Genera todos los documentos del módulo 4 con la identidad visual corporativa:
 * encabezado azul oscuro + azul primario, tabla de datos con colores alternados,
 * sección de títulos y pie de página oficial.
 *
 * Uso básico:
 *   ByteArrayOutputStream out = new ByteArrayOutputStream();
 *   Document doc = pdfTemplateService.createDocument(out);
 *   pdfTemplateService.addHeader(doc, "Certificado de Afiliación");
 *   // ... agregar contenido del certificado ...
 *   pdfTemplateService.addFooter(doc);
 *   doc.close();
 *   byte[] bytes = out.toByteArray();
 */
@Service
public class PdfTemplateService {

    // ── Paleta de colores BreazeLife ──────────────────────────────────────────
    private static final DeviceRgb COLOR_DARK  = new DeviceRgb(15, 40, 80);    // Azul oscuro
    private static final DeviceRgb COLOR_BLUE  = new DeviceRgb(0, 102, 204);   // Azul primario
    private static final DeviceRgb COLOR_LIGHT = new DeviceRgb(240, 245, 255); // Fondo suave
    private static final DeviceRgb COLOR_GRAY  = new DeviceRgb(100, 100, 100); // Texto gris
    private static final DeviceRgb COLOR_BORDER = new DeviceRgb(200, 210, 230);

    private static final DateTimeFormatter DATE_CO =
        DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy");

    // ── Crear documento ───────────────────────────────────────────────────────

    /**
     * Crea un nuevo documento iText A4 listo para escribir.
     * @param outputStream stream donde se escribirá el PDF
     * @return Document de iText con márgenes configurados
     */
    public Document createDocument(ByteArrayOutputStream outputStream) {
        PdfWriter writer   = new PdfWriter(outputStream);
        PdfDocument pdf    = new PdfDocument(writer);
        Document document  = new Document(pdf, PageSize.A4);
        document.setMargins(40, 50, 60, 50);
        return document;
    }

    // ── Encabezado ────────────────────────────────────────────────────────────

    /**
     * Agrega el encabezado oficial BreazeLife S.A. al documento.
     * @param document  documento abierto
     * @param titleText título del documento (ej: "Certificado de Afiliación")
     */
    public void addHeader(Document document, String titleText) {
        // Tabla de dos celdas: nombre empresa (izquierda) | datos empresa (derecha)
        Table header = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
            .setWidth(UnitValue.createPercentValue(100))
            .setBorder(Border.NO_BORDER);

        // Celda izquierda — nombre y tipo de fondo
        Cell left = new Cell().setBorder(Border.NO_BORDER)
            .setBackgroundColor(COLOR_DARK).setPadding(15);
        left.add(new Paragraph("BreazeLife S.A.")
            .setFontColor(ColorConstants.WHITE).setBold().setFontSize(16));
        left.add(new Paragraph("Fondo de Pensiones Obligatorias")
            .setFontColor(new DeviceRgb(180, 200, 230)).setFontSize(9));
        header.addCell(left);

        // Celda derecha — info legal
        Cell right = new Cell().setBorder(Border.NO_BORDER)
            .setBackgroundColor(COLOR_BLUE).setPadding(15)
            .setTextAlignment(TextAlignment.RIGHT);
        right.add(new Paragraph("NIT: 900.000.001-1")
            .setFontColor(ColorConstants.WHITE).setFontSize(9));
        right.add(new Paragraph("www.breazelife.com.co")
            .setFontColor(new DeviceRgb(180, 210, 255)).setFontSize(9));
        right.add(new Paragraph("Vigilado SuperFinanciera")
            .setFontColor(new DeviceRgb(180, 210, 255)).setFontSize(8));
        header.addCell(right);

        document.add(header);

        // Línea separadora
        document.add(new LineSeparator(new SolidLine(2f))
            .setMarginTop(0).setMarginBottom(20));

        // Título del documento
        document.add(new Paragraph(titleText)
            .setFontSize(18).setBold()
            .setFontColor(COLOR_DARK)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(5));

        // Fecha de generación
        document.add(new Paragraph("Generado el: " + LocalDate.now().format(DATE_CO))
            .setFontSize(9).setFontColor(COLOR_GRAY)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(20));
    }

    // ── Pie de página ─────────────────────────────────────────────────────────

    /**
     * Agrega el pie de página oficial al documento.
     */
    public void addFooter(Document document) {
        document.add(new LineSeparator(new SolidLine(0.5f))
            .setMarginTop(30).setMarginBottom(8));

        Table footer = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
            .setWidth(UnitValue.createPercentValue(100))
            .setBorder(Border.NO_BORDER);

        footer.addCell(new Cell().setBorder(Border.NO_BORDER)
            .add(new Paragraph("BreazeLife S.A. — Fondo de Pensiones Obligatorias")
                .setFontSize(8).setFontColor(COLOR_GRAY)));

        footer.addCell(new Cell().setBorder(Border.NO_BORDER)
            .setTextAlignment(TextAlignment.RIGHT)
            .add(new Paragraph("Documento generado electrónicamente. Válido sin firma.")
                .setFontSize(8).setFontColor(COLOR_GRAY)));

        document.add(footer);
    }

    // ── Sección con título ────────────────────────────────────────────────────

    /**
     * Agrega un título de sección con línea inferior azul.
     */
    public void addSectionTitle(Document document, String title) {
        document.add(new Paragraph(title)
            .setFontSize(12).setBold()
            .setFontColor(COLOR_BLUE)
            .setMarginTop(15).setMarginBottom(8)
            .setBorderBottom(new SolidBorder(COLOR_BLUE, 1)));
    }

    // ── Tabla de datos ────────────────────────────────────────────────────────

    /**
     * Crea una tabla de 2 columnas (campo | valor) con estilo BreazeLife.
     */
    public Table createDataTable() {
        return new Table(UnitValue.createPercentArray(new float[]{40, 60}))
            .setWidth(UnitValue.createPercentValue(100))
            .setMarginBottom(20);
    }

    /**
     * Agrega una fila a la tabla de datos.
     * @param table  tabla creada con createDataTable()
     * @param label  nombre del campo
     * @param value  valor del campo
     * @param isEven para alternar color de fondo
     */
    public void addTableRow(Table table, String label, String value, boolean isEven) {
        Color bg = isEven ? COLOR_LIGHT : ColorConstants.WHITE;

        table.addCell(new Cell()
            .setBackgroundColor(bg)
            .setBorder(new SolidBorder(COLOR_BORDER, 0.5f))
            .setPadding(8)
            .add(new Paragraph(label)
                .setBold().setFontSize(10).setFontColor(COLOR_DARK)));

        table.addCell(new Cell()
            .setBackgroundColor(bg)
            .setBorder(new SolidBorder(COLOR_BORDER, 0.5f))
            .setPadding(8)
            .add(new Paragraph(value != null ? value : "—")
                .setFontSize(10)));
    }

    // ── Tabla de movimientos ──────────────────────────────────────────────────

    /**
     * Agrega una fila de encabezado a cualquier tabla de movimientos.
     */
    public void addTableHeaderRow(Table table, String... headers) {
        for (String h : headers) {
            table.addHeaderCell(new Cell()
                .setBackgroundColor(COLOR_BLUE)
                .setBorder(Border.NO_BORDER)
                .setPadding(7)
                .add(new Paragraph(h)
                    .setFontColor(ColorConstants.WHITE)
                    .setBold().setFontSize(9)));
        }
    }

    /**
     * Agrega una fila de datos a una tabla de movimientos.
     */
    public void addMovementRow(Table table, boolean isEven, String... values) {
        Color bg = isEven ? COLOR_LIGHT : ColorConstants.WHITE;
        for (String v : values) {
            table.addCell(new Cell()
                .setBackgroundColor(bg)
                .setBorder(new SolidBorder(COLOR_BORDER, 0.3f))
                .setPadding(6)
                .add(new Paragraph(v != null ? v : "—")
                    .setFontSize(9)));
        }
    }
}