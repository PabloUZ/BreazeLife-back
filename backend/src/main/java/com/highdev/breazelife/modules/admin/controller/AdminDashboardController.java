package com.highdev.breazelife.modules.admin.controller;

import com.highdev.breazelife.modules.admin.dto.response.AdminDashboardSummaryResponseDTO;
import com.highdev.breazelife.modules.admin.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
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
}
