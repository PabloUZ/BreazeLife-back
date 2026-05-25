package com.highdev.breazelife.modules.employer.controller;

import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.employer.dto.request.RegisterEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployerProfileDTO;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployerRepresentativeDTO;
import com.highdev.breazelife.modules.employer.dto.response.EmployerProfileResponseDTO;
import com.highdev.breazelife.modules.employer.dto.response.ListEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.RegisterEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.UpdateEmployeeResponse;
import com.highdev.breazelife.modules.employer.service.EmployerService;
import com.highdev.breazelife.modules.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.highdev.breazelife.modules.employer.dto.request.UpdateLegalRepresentativeDto;
import com.highdev.breazelife.modules.employer.dto.response.EmployerProfileResponseDTO;
import com.highdev.breazelife.modules.employer.service.EmployerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employers")
@PreAuthorize("hasRole('EMPLOYER')")
@Tag(name = "Employer Profile", description = "Employer profile and account settings")
public class EmployerController {

    @Autowired
    private EmployerService employerService;

    @Operation(summary = "Obtener perfil del empleador", description = "Retorna los datos básicos de la empresa autenticada")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Perfil encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "El empleador no existe en el sistema")
    })
    @GetMapping("/profile")
    public ResponseEntity<EmployerProfileResponseDTO> getProfile(@AuthenticationPrincipal User authenticatedUser) {
        String userIdFromToken = authenticatedUser.getId(); 
        return ResponseEntity.ok(employerService.getProfile(userIdFromToken));
    }

    @Operation(summary = "Actualizar datos de la empresa", description = "Permite modificar el nombre de la empresa y el sector")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Perfil actualizado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
        @ApiResponse(responseCode = "404", description = "El empleador no existe")
    })
    @PutMapping("/profile") 
    public ResponseEntity<EmployerProfileResponseDTO> updateProfile(
            @AuthenticationPrincipal User authenticatedUser,
            @Valid @RequestBody UpdateEmployerProfileDTO dto) {
        
        String userIdFromToken = authenticatedUser.getId();
        EmployerProfileResponseDTO updated = employerService.updateProfile(userIdFromToken, dto);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Actualizar representante legal", description = "Permite modificar los datos del representante legal de la empresa")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Representante legal actualizado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
        @ApiResponse(responseCode = "404", description = "El empleador no existe")
    })
    @PutMapping("/legal-representative") 
    public ResponseEntity<EmployerProfileResponseDTO> updateLegalRepresentative(
            @AuthenticationPrincipal User authenticatedUser,
            @Valid @RequestBody UpdateEmployerRepresentativeDTO dto) {
        
        String userIdFromToken = authenticatedUser.getId();
        EmployerProfileResponseDTO updated = employerService.updateLegalRepresentative(userIdFromToken, dto);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Listar empleados de la empresa", description = "Retorna una lista paginada de todos los trabajadores vinculados contractualmente")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Listado de empleados generado correctamente"),
        @ApiResponse(responseCode = "401", description = "No autorizado"),
        @ApiResponse(responseCode = "404", description = "El empleador no existe")
    })
    @GetMapping("/employees")
    public ResponseEntity<Page<ListEmployeeResponse>> getCompanyEmployees(
            @AuthenticationPrincipal User authenticatedUser,
            @Parameter(description = "Filtrar por estado del afiliado (ACTIVE, INACTIVE, etc.)")
            @RequestParam(required = false) Affiliate.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        String userIdFromToken = authenticatedUser.getId();
        Page<ListEmployeeResponse> employees = employerService.getCompanyEmployees(userIdFromToken, status, page, size);
        return ResponseEntity.ok(employees);
    }

    @Operation(summary = "Registrar un nuevo empleado", description = "Crea un usuario/afiliado en el sistema si no existe y le vincula un contrato laboral activo")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Empleado registrado y vinculado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o el empleado ya está contratado"),
        @ApiResponse(responseCode = "404", description = "El empleador no existe o no está activo")
    })
    @PostMapping("/employees") // <--- ¡AQUÍ ESTÁ EL ENDPOINT QUE TE HACÍA FALTA!
    public ResponseEntity<RegisterEmployeeResponse> registerEmployee(
            @AuthenticationPrincipal User authenticatedUser,
            @Valid @RequestBody RegisterEmployeeRequest dto) {
        
        String userIdFromToken = authenticatedUser.getId();
        RegisterEmployeeResponse response = employerService.registerEmployee(userIdFromToken, dto);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Actualizar datos de un empleado", description = "Permite modificar los datos personales básicos de un trabajador vinculado")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Datos del empleado actualizados correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
        @ApiResponse(responseCode = "404", description = "Contrato o empleado no encontrado para esta empresa")
    })
    @PutMapping("/employees/{contractId}")
    public ResponseEntity<UpdateEmployeeResponse> updateEmployee(
            @AuthenticationPrincipal User authenticatedUser,
            @PathVariable String contractId,
            @Valid @RequestBody UpdateEmployeeRequest dto) {
        
        String userIdFromToken = authenticatedUser.getId();
        UpdateEmployeeResponse response = employerService.updateEmployee(userIdFromToken, contractId, dto);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Obtener detalle de un empleado", description = "Retorna la información laboral y personal detallada de un trabajador usando su ID de contrato")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Detalle del empleado encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "El contrato o el empleado no existen para esta empresa")
    })
    @GetMapping("/employees/{contractId}") // <--- ¡ESTE ES EL QUE FALTA!
    public ResponseEntity<com.highdev.breazelife.modules.employer.dto.response.EmployeeDetailResponse> getEmployeeDetail(
            @AuthenticationPrincipal User authenticatedUser,
            @PathVariable String contractId) {
        
        String userIdFromToken = authenticatedUser.getId();
        com.highdev.breazelife.modules.employer.dto.response.EmployeeDetailResponse response = 
                employerService.getEmployeeDetail(userIdFromToken, contractId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Modificar condiciones contractuales", description = "Permite aplicar aumentos de salario o ascensos (cambios de cargo) a un contrato activo")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Contrato actualizado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o inconsistentes"),
        @ApiResponse(responseCode = "404", description = "Contrato no encontrado para esta empresa")
    })
    @PatchMapping("/employees/{contractId}/job-conditions")
    public ResponseEntity<com.highdev.breazelife.modules.employer.dto.response.EmployeeDetailResponse> updateJobConditions(
            @AuthenticationPrincipal User authenticatedUser,
            @PathVariable String contractId,
            @Valid @RequestBody com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeContractRequest dto) {
        
        String userIdFromToken = authenticatedUser.getId();
        com.highdev.breazelife.modules.employer.dto.response.EmployeeDetailResponse response = 
                employerService.updateContractConditions(userIdFromToken, contractId, dto);
        return ResponseEntity.ok(response);
    }
}