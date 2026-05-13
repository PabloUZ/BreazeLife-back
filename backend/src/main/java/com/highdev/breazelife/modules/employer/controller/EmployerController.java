package com.highdev.breazelife.modules.employer.controller;

import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployerProfileDto;
import com.highdev.breazelife.modules.employer.dto.request.UpdateLegalRepresentativeDto;
import com.highdev.breazelife.modules.employer.dto.response.EmployerProfileResponseDTO;
import com.highdev.breazelife.modules.employer.service.EmployerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employers/profile")
public class EmployerController {

    @Autowired
    private EmployerService employerService;

    @GetMapping
    public ResponseEntity<EmployerProfileResponseDTO> getProfile() {
        String userIdFromToken = "id-quemado-para-pruebas"; 
        return ResponseEntity.ok(employerService.getProfile(userIdFromToken));
    }

    @PutMapping
    public ResponseEntity<EmployerProfileResponseDTO> updateProfile(
            @Valid @RequestBody UpdateEmployerProfileDto dto) {
        String userIdFromToken = "id-quemado-para-pruebas";
        return ResponseEntity.ok(employerService.updateProfile(userIdFromToken, dto));
    }

    @PatchMapping("/legal-representative")
    public ResponseEntity<EmployerProfileResponseDTO> updateLegalRep(
            @Valid @RequestBody UpdateLegalRepresentativeDto dto) {
        String userIdFromToken = "id-quemado-para-pruebas";
        return ResponseEntity.ok(employerService.updateLegalRepresentative(userIdFromToken, dto));
    }
}