package com.highdev.breazelife.modules.profitability.controller;

import com.highdev.breazelife.modules.profitability.dto.response.ApplyProfitabilityResponseDto;
import com.highdev.breazelife.modules.profitability.service.ProfitabilityService;
import com.highdev.breazelife.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/profitability")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Profitability", description = "Aplicación de rentabilidad mensual simulada para todos los afiliados")
public class ProfitabilityController {

    private final ProfitabilityService profitabilityService;

    public ProfitabilityController(ProfitabilityService profitabilityService) {
        this.profitabilityService = profitabilityService;
    }

    @Operation(
            summary = "Aplicar rentabilidad mensual",
            description = """
                    Aplica la rentabilidad mensual simulada a todas las cuentas de afiliados con un solo proceso.
                    
                    Tasas mensuales por tipo de fondo:
                    - CONSERVATIVE: 0.4%
                    - MODERATE: 0.6%
                    - RISKY: 0.8%
                    
                    Fórmula:
                    - Rentabilidad del mes = Saldo acumulado × Tasa mensual
                    - Nuevo saldo = Saldo acumulado + Rentabilidad del mes
                    
                    Solo puede ejecutarse UNA VEZ por mes. Si ya fue aplicada, retorna error 400.
                    """
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Rentabilidad aplicada exitosamente a todos los afiliados"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "La rentabilidad ya fue aplicada este mes"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado - Se requiere rol ADMIN")
    })
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<ApplyProfitabilityResponseDto>> applyMonthlyProfitability() {
        ApplyProfitabilityResponseDto data = profitabilityService.applyMonthlyProfitability();
        return ResponseEntity.ok(ApiResponse.of(
                "Monthly profitability applied successfully to " + data.accountsProcessed() + " accounts.",
                200,
                "OK",
                data
        ));
    }
}

