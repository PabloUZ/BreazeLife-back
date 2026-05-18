package com.highdev.breazelife.modules.employer.controller;

import com.highdev.breazelife.modules.employer.dto.response.EmployerProfileResponseDTO;
import com.highdev.breazelife.modules.employer.service.EmployerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employers")
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
    public ResponseEntity<EmployerProfileResponseDTO> getProfile() {
        // En un paso real, obtendrás el ID del token JWT
        String userIdFromToken = "id-quemado-para-pruebas"; 
        
        return ResponseEntity.ok(employerService.getProfile(userIdFromToken));
    }
}