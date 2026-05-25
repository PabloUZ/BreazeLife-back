package com.highdev.breazelife.modules.employer.controller;

import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployerProfileDTO;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployerRepresentativeDTO;
import com.highdev.breazelife.modules.employer.dto.response.EmployerProfileResponseDTO;
import com.highdev.breazelife.modules.employer.service.EmployerService;
import com.highdev.breazelife.modules.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployerProfileDto;
import com.highdev.breazelife.modules.employer.dto.request.UpdateLegalRepresentativeDto;
import com.highdev.breazelife.modules.employer.dto.response.EmployerProfileResponseDTO;
import com.highdev.breazelife.modules.employer.service.EmployerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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
        @ApiResponse(responseCode = "404", description = "El empleador no existe")
    })
    @PutMapping("/profile") 
    public ResponseEntity<EmployerProfileResponseDTO> updateProfile(
            @AuthenticationPrincipal User authenticatedUser,
            @RequestBody UpdateEmployerProfileDTO dto) {
        
        String userIdFromToken = authenticatedUser.getId();
        EmployerProfileResponseDTO updated = employerService.updateProfile(userIdFromToken, dto);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Actualizar representante legal", description = "Permite modificar los datos del representante legal de la empresa")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Representante legal actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "El empleador no existe")
    })
    @PutMapping("/legal-representative") 
    public ResponseEntity<EmployerProfileResponseDTO> updateLegalRepresentative(
            @AuthenticationPrincipal User authenticatedUser,
            @RequestBody UpdateEmployerRepresentativeDTO dto) {
        
        String userIdFromToken = authenticatedUser.getId();
        EmployerProfileResponseDTO updated = employerService.updateLegalRepresentative(userIdFromToken, dto);
        return ResponseEntity.ok(updated);
    }
}