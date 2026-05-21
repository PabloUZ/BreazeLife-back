package com.highdev.breazelife.modules.admin.controller;

import com.highdev.breazelife.modules.admin.dto.response.AdminDashboardGraphsResponseDTO;
import com.highdev.breazelife.modules.admin.dto.response.AdminDashboardSummaryResponseDTO;
import com.highdev.breazelife.modules.admin.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Dashboard", description = "General dashboard metrics for administrators")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @Operation(summary = "Obtener resumen del dashboard administrativo", description = "Retorna métricas generales del sistema para el panel de administración")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Resumen obtenido exitosamente")
    })
    @GetMapping("/summary")
    public ResponseEntity<AdminDashboardSummaryResponseDTO> getSummary() {
        return ResponseEntity.ok(adminDashboardService.getSummary());
    }

    @Operation(summary = "Obtener gráficas del dashboard administrativo", description = "Retorna datos agregados para las gráficas del panel de administración")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Datos gráficos obtenidos exitosamente")
    })
    @GetMapping("/graphs")
    public ResponseEntity<AdminDashboardGraphsResponseDTO> getGraphs() {
        return ResponseEntity.ok(adminDashboardService.getGraphs());
    }
}
