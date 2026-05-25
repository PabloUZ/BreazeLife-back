package com.highdev.breazelife.modules.config.controller;

import com.highdev.breazelife.modules.config.dto.request.UpdateSystemConfigRequestDto;
import com.highdev.breazelife.modules.config.dto.response.SystemConfigResponseDto;
import com.highdev.breazelife.modules.config.service.SystemConfigService;
import com.highdev.breazelife.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/config")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Config", description = "Configuración de parámetros del sistema: tasas, expectativa de vida y porcentaje de cotización")
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    public SystemConfigController(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    @Operation(
            summary = "Obtener configuración del sistema",
            description = "Retorna todos los parámetros configurables: tasas mensuales por tipo de fondo, expectativa de vida y porcentaje de cotización vigente."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Configuración obtenida exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado - Se requiere rol ADMIN")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<SystemConfigResponseDto>> getConfig() {
        SystemConfigResponseDto config = systemConfigService.getConfig();
        return ResponseEntity.ok(ApiResponse.of("System configuration retrieved successfully.", 200, "OK", config));
    }

    @Operation(
            summary = "Actualizar configuración del sistema",
            description = """
                    Actualiza los parámetros configurables del sistema.
                    
                    Parámetros:
                    - `rate_conservative`: Tasa mensual fondo conservador (ej: 0.004 = 0.4%)
                    - `rate_moderate`: Tasa mensual fondo moderado (ej: 0.006 = 0.6%)
                    - `rate_risky`: Tasa mensual fondo mayor riesgo (ej: 0.008 = 0.8%)
                    - `life_expectancy`: Expectativa de vida en años (ej: 62)
                    - `contribution_rate`: Porcentaje de cotización vigente (ej: 0.16 = 16%)
                    
                    Los cambios en tasas aplican en la próxima ejecución de rentabilidad mensual.
                    """
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Configuración actualizada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado - Se requiere rol ADMIN")
    })
    @PutMapping
    public ResponseEntity<ApiResponse<SystemConfigResponseDto>> updateConfig(
            @Valid @RequestBody UpdateSystemConfigRequestDto request) {
        SystemConfigResponseDto updated = systemConfigService.updateConfig(request);
        return ResponseEntity.ok(ApiResponse.of("System configuration updated successfully.", 200, "OK", updated));
    }
}

