package com.highdev.breazelife.modules.admin.controller;

import com.highdev.breazelife.modules.admin.dto.request.SuspendAccountRequestDto;
import com.highdev.breazelife.modules.admin.dto.response.AdminAccountActionResponseDto;
import com.highdev.breazelife.modules.admin.dto.response.AdminAccountDetailDto;
import com.highdev.breazelife.modules.admin.dto.response.AdminAccountListItemDto;
import com.highdev.breazelife.modules.admin.service.AdminAccountService;
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
@RequestMapping("/api/v1/admin/accounts")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Accounts", description = "Account management endpoints for affiliate and employer users")
public class AdminAccountController {

    private final AdminAccountService adminAccountService;

    public AdminAccountController(AdminAccountService adminAccountService) {
        this.adminAccountService = adminAccountService;
    }

    @Operation(summary = "Obtener cuentas administrables", description = "Retorna cuentas de afiliados y empleadores con filtros opcionales para gestión administrativa")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cuentas obtenidas exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Filtro inválido o acción no permitida"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminAccountListItemDto>>> getAccounts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) String search
    ) {
        AdminAccountService.AdminAccountsPage result = adminAccountService.getAccounts(page, limit, role, status, verified, search);
        return ResponseEntity.ok(ApiResponse.of(
                "Accounts retrieved successfully",
                200,
                "OK",
                result.accounts(),
                result.pagination()
        ));
    }

    @Operation(summary = "Consultar cuenta administrable", description = "Retorna el detalle de una cuenta de afiliado o empleador")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cuenta obtenida exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Rol de cuenta inválido o acción no permitida"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Cuenta no encontrada")
    })
    @GetMapping("/{user_id}")
    public ResponseEntity<ApiResponse<AdminAccountDetailDto>> getAccountById(@PathVariable("user_id") String userId) {
        AdminAccountDetailDto data = adminAccountService.getAccountById(userId);
        return ResponseEntity.ok(ApiResponse.of("Account retrieved successfully", 200, "OK", data));
    }

    @Operation(summary = "Verificar cuenta", description = "Marca como verificada una cuenta de afiliado o empleador")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cuenta verificada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Rol de cuenta inválido o acción no permitida"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Cuenta no encontrada")
    })
    @PatchMapping("/{user_id}/verify")
    public ResponseEntity<ApiResponse<AdminAccountActionResponseDto>> verifyAccount(@PathVariable("user_id") String userId) {
        AdminAccountActionResponseDto data = adminAccountService.verifyAccount(userId);
        return ResponseEntity.ok(ApiResponse.of("Account verified successfully", 200, "OK", data));
    }

    @Operation(summary = "Suspender cuenta", description = "Suspende una cuenta de afiliado o empleador y almacena una razón opcional")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cuenta suspendida exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Rol de cuenta inválido o acción no permitida"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Cuenta no encontrada")
    })
    @PatchMapping("/{user_id}/suspend")
    public ResponseEntity<ApiResponse<AdminAccountActionResponseDto>> suspendAccount(
            @PathVariable("user_id") String userId,
            @Valid @RequestBody(required = false) SuspendAccountRequestDto request
    ) {
        AdminAccountActionResponseDto data = adminAccountService.suspendAccount(userId, request);
        return ResponseEntity.ok(ApiResponse.of("Account suspended successfully", 200, "OK", data));
    }

    @Operation(summary = "Activar cuenta", description = "Activa nuevamente una cuenta de afiliado o empleador")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cuenta activada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Rol de cuenta inválido o acción no permitida"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Cuenta no encontrada")
    })
    @PatchMapping("/{user_id}/activate")
    public ResponseEntity<ApiResponse<AdminAccountActionResponseDto>> activateAccount(@PathVariable("user_id") String userId) {
        AdminAccountActionResponseDto data = adminAccountService.activateAccount(userId);
        return ResponseEntity.ok(ApiResponse.of("Account activated successfully", 200, "OK", data));
    }
}
