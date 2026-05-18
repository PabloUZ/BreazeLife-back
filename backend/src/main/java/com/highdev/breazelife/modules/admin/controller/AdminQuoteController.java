package com.highdev.breazelife.modules.admin.controller;

import com.highdev.breazelife.modules.admin.dto.request.ReviewQuoteRequestDto;
import com.highdev.breazelife.modules.admin.dto.response.AdminQuoteResponseDto;
import com.highdev.breazelife.modules.admin.service.AdminQuoteService;
import com.highdev.breazelife.modules.quote.entity.Quote;
import com.highdev.breazelife.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/quotes")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Quotes", description = "Quote review endpoints for administrators")
public class AdminQuoteController {

    private final AdminQuoteService adminQuoteService;

    public AdminQuoteController(AdminQuoteService adminQuoteService) {
        this.adminQuoteService = adminQuoteService;
    }

    @Operation(summary = "Obtener cotizaciones para revisión", description = "Retorna cotizaciones para revisión administrativa, priorizando las pendientes por defecto")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cotizaciones obtenidas exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Filtro inválido"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminQuoteResponseDto>>> getQuotes(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Quote.QuoteStatus status
    ) {
        AdminQuoteService.AdminQuotesPage result = adminQuoteService.getQuotes(page, limit, status);
        return ResponseEntity.ok(ApiResponse.of(
                "Quotes retrieved successfully",
                200,
                "OK",
                result.quotes(),
                result.pagination()
        ));
    }

    @Operation(summary = "Consultar cotización", description = "Retorna el detalle completo de una cotización para revisión administrativa")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cotización obtenida exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Cotización no encontrada")
    })
    @GetMapping("/{quote_id}")
    public ResponseEntity<ApiResponse<AdminQuoteResponseDto>> getQuoteById(@PathVariable("quote_id") String quoteId) {
        AdminQuoteResponseDto data = adminQuoteService.getQuoteById(quoteId);
        return ResponseEntity.ok(ApiResponse.of("Quote retrieved successfully", 200, "OK", data));
    }

    @Operation(summary = "Aprobar cotización", description = "Aprueba una cotización pendiente y registra el comentario de revisión cuando aplique")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cotización aprobada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Cotización en estado inválido para aprobación"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Cotización no encontrada")
    })
    @PatchMapping("/{quote_id}/approve")
    public ResponseEntity<ApiResponse<AdminQuoteResponseDto>> approveQuote(
            @PathVariable("quote_id") String quoteId,
            @Valid @RequestBody(required = false) ReviewQuoteRequestDto request
    ) {
        AdminQuoteResponseDto data = adminQuoteService.approveQuote(quoteId, request);
        return ResponseEntity.ok(ApiResponse.of("Quote approved successfully", 200, "OK", data));
    }

    @Operation(summary = "Rechazar cotización", description = "Rechaza una cotización pendiente y registra el comentario de revisión cuando aplique")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cotización rechazada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Cotización en estado inválido para rechazo"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Cotización no encontrada")
    })
    @PatchMapping("/{quote_id}/reject")
    public ResponseEntity<ApiResponse<AdminQuoteResponseDto>> rejectQuote(
            @PathVariable("quote_id") String quoteId,
            @Valid @RequestBody(required = false) ReviewQuoteRequestDto request
    ) {
        AdminQuoteResponseDto data = adminQuoteService.rejectQuote(quoteId, request);
        return ResponseEntity.ok(ApiResponse.of("Quote rejected successfully", 200, "OK", data));
    }
}
