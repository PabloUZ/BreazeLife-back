package com.highdev.breazelife.modules.admin.controller;

import com.highdev.breazelife.modules.admin.service.AdminReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Reports", description = "Generación de reportes globales en PDF por rango de fechas")
public class AdminReportController {

    private static final DateTimeFormatter FILE_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final AdminReportService adminReportService;

    public AdminReportController(AdminReportService adminReportService) {
        this.adminReportService = adminReportService;
    }

    @Operation(
            summary = "Reporte global de cotizaciones en PDF",
            description = "Genera y descarga un PDF con todas las cotizaciones registradas en el rango de fechas especificado."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PDF generado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Parámetros inválidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado - Se requiere rol ADMIN")
    })
    @GetMapping("/quotes")
    public ResponseEntity<byte[]> downloadQuotesReport(
            @Parameter(description = "Fecha de inicio (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Fecha de fin (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        byte[] pdf = adminReportService.generateQuotesReport(from, to);
        String filename = "reporte-cotizaciones-" + from.format(FILE_DATE) + "-" + to.format(FILE_DATE) + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }

    @Operation(
            summary = "Reporte global de afiliados en PDF",
            description = "Genera y descarga un PDF con todos los afiliados registrados. Si se especifica rango de fechas, filtra por fecha de afiliación."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PDF generado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Parámetros inválidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado - Se requiere rol ADMIN")
    })
    @GetMapping("/affiliates")
    public ResponseEntity<byte[]> downloadAffiliatesReport(
            @Parameter(description = "Fecha de inicio de afiliación (YYYY-MM-DD), opcional")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Fecha de fin de afiliación (YYYY-MM-DD), opcional")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        byte[] pdf = adminReportService.generateAffiliatesReport(from, to);
        String suffix = (from != null && to != null)
                ? from.format(FILE_DATE) + "-" + to.format(FILE_DATE)
                : "completo-" + LocalDate.now().format(FILE_DATE);
        String filename = "reporte-afiliados-" + suffix + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }
}

