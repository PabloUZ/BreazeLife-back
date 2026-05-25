package com.highdev.breazelife.modules.document.util;

import com.highdev.breazelife.modules.document.service.PdfTemplateService;
import com.highdev.breazelife.modules.payment.dto.response.PaymentDetailResponse;
import com.highdev.breazelife.modules.payment.dto.response.PayrollDetailResponse;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Table;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

@Component
public class PdfGeneratorEngine {

    private final PdfTemplateService templateService;

    public PdfGeneratorEngine(PdfTemplateService templateService) {
        this.templateService = templateService;
    }

    public byte[] generateIndividualPayslipPdf(PaymentDetailResponse data) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = templateService.createDocument(out);
        
        // Encabezado institucional
        templateService.addHeader(doc, "COLILLA DE PAGO INDIVIDUAL");
        
        // Sección: Información Básica
        templateService.addSectionTitle(doc, "Información del Empleado y Contrato");
        Table infoTable = templateService.createDataTable();
        templateService.addTableRow(infoTable, "Empleado / Afiliado", data.getAffiliateName(), false);
        templateService.addTableRow(infoTable, "Documento de Identidad", data.getDocument(), true);
        templateService.addTableRow(infoTable, "Cargo del Trabajador", data.getPosition(), false);
        templateService.addTableRow(infoTable, "Periodo Liquidado", data.getPeriod(), true);
        templateService.addTableRow(infoTable, "Días Cotizados", String.valueOf(data.getDaysContributed()), false);
        doc.add(infoTable);

        // Sección: Liquidación Financiera
        templateService.addSectionTitle(doc, "Resumen de Conceptos y Deducciones (Pensión)");
        Table financialTable = templateService.createDataTable();
        templateService.addTableRow(financialTable, "Salario Base de Cotización (IBC)", "$" + data.getBaseSalary(), false);
        templateService.addTableRow(financialTable, "Deducción Trabajador (4%)", "-$" + data.getEmployeePensionDeduction(), true);
        templateService.addTableRow(financialTable, "Aporte Patronal Empleador (12%)", "$" + data.getEmployerPensionContrib(), false);
        templateService.addTableRow(financialTable, "Total Aportado al Fondo (16%)", "$" + data.getTotalPensionContrib(), true);
        templateService.addTableRow(financialTable, "NETO DISPERSADO A CUENTA (96%)", "$" + data.getNetSalary(), false);
        doc.add(financialTable);

        // Pie de página institucional
        templateService.addFooter(doc);
        doc.close();
        
        return out.toByteArray();
    }

    public byte[] generatePayrollReceiptPdf(PayrollDetailResponse data) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = templateService.createDocument(out);
        
        templateService.addHeader(doc, "COMPROBANTE CONSOLIDADO DE NÓMINA");
        
        templateService.addSectionTitle(doc, "Resumen General de la Operación");
        Table summaryTable = templateService.createDataTable();
        summaryTable.addCell("Periodo Declarado: " + data.getPeriod());
        templateService.addTableRow(summaryTable, "Total Empleados Procesados", String.valueOf(data.getTotals().getTotalEmployees()), false);
        templateService.addTableRow(summaryTable, "Total Salarios Brutos", "$" + data.getTotals().getTotalGrossSalary(), true);
        templateService.addTableRow(summaryTable, "Total Aportes Consolidados", "$" + data.getTotals().getTotalPensionContrib(), false);
        templateService.addTableRow(summaryTable, "Total Débito Neto de Fondos", "$" + data.getTotals().getTotalDebit(), true);
        doc.add(summaryTable);

        // Tabla de movimientos masivos (Grilla de empleados)
        templateService.addSectionTitle(doc, "Detalle de Pagos por Colaborador");
        // Usamos una tabla de 4 columnas
        Table grid = new Table(new float[]{30, 20, 25, 25}).useAllAvailableWidth();
        templateService.addTableHeaderRow(grid, "Empleado", "Documento", "Base IBC", "Neto Pagado");

        for (int i = 0; i < data.getPayments().size(); i++) {
            var p = data.getPayments().get(i);
            templateService.addMovementRow(grid, i % 2 == 0, 
                p.getAffiliateName(), 
                p.getDocument(), 
                "$" + p.getBaseSalary(), 
                "$" + p.getNetSalary()
            );
        }
        doc.add(grid);

        templateService.addFooter(doc);
        doc.close();
        
        return out.toByteArray();
    }
}