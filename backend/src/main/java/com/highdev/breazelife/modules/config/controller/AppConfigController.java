package com.highdev.breazelife.modules.config.controller;

import com.highdev.breazelife.modules.config.dto.response.SystemConfigResponseDto;
import com.highdev.breazelife.modules.config.service.SystemConfigService;
import com.highdev.breazelife.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/config")
@Tag(name = "App Config", description = "Lectura pública (autenticado) de los parámetros vigentes del sistema")
public class AppConfigController {

    private final SystemConfigService systemConfigService;

    public AppConfigController(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    @Operation(
            summary = "Obtener parámetros vigentes del sistema",
            description = "Retorna las tasas de rentabilidad, expectativa de vida y porcentaje de cotización vigentes. Accesible para todos los roles autenticados."
    )
    @GetMapping
    public ResponseEntity<ApiResponse<SystemConfigResponseDto>> getAppConfig() {
        SystemConfigResponseDto config = systemConfigService.getConfig();
        return ResponseEntity.ok(ApiResponse.of("System configuration retrieved successfully.", 200, "OK", config));
    }
}

