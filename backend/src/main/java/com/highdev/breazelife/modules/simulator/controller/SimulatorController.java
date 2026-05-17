package com.highdev.breazelife.modules.simulator.controller;

import com.highdev.breazelife.modules.simulator.dto.request.SimulatorRequest;
import com.highdev.breazelife.modules.simulator.dto.response.SimulatorResponse;
import com.highdev.breazelife.modules.simulator.service.SimulatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * BLIFE-16 / BLIFE-64
 *
 * Endpoint del simulador de pensión obligatoria.
 *
 * POST /api/v1/affiliates/simulator → proyecta saldo futuro y mesada mensual
 */
@RestController
@RequestMapping("/api/v1/affiliates/simulator")
@RequiredArgsConstructor
@Tag(name = "Pension Simulator", description = "Pension fund growth simulator for affiliates")
public class SimulatorController {

    private final SimulatorService simulatorService;

    /**
     * POST /api/v1/affiliates/simulator
     *
     * Recibe edad actual, edad de retiro y salario esperado.
     * Retorna proyección de saldo futuro, mesada mensual y datos
     * mes a mes para la gráfica de crecimiento.
     *
     * Los datos del afiliado (balance, quotedDays, accountType) se reciben
     * directamente en el request por ahora.
     * TODO: en Sprint 2 obtenerlos automáticamente del JWT + accountService.
     */
    @PostMapping
    @Operation(
        summary = "Simulate pension projection",
        description = "Projects future pension balance and monthly pension amount. " +
            "Returns month-by-month growth data for charts (BLIFE-64)."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Simulation calculated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input — check ages and salary"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> simulate(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody SimulatorRequest request) {

        SimulatorResponse result = simulatorService.simulate(request);

        return ResponseEntity.ok(Map.of(
            "message",     "Simulation calculated successfully",
            "status_code", 200,
            "status",      "OK",
            "data",        result
        ));
    }
}