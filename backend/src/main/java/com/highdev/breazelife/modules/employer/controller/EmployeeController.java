package com.highdev.breazelife.modules.employer.controller;

import com.highdev.breazelife.modules.employer.dto.request.RegisterEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.response.RegisterEmployeeResponse;
import com.highdev.breazelife.modules.employer.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employers")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping("/{employerId}/employees")
    public ResponseEntity<RegisterEmployeeResponse> registerEmployee(
        @PathVariable String employerId,
        @Valid @RequestBody RegisterEmployeeRequest request) {

        RegisterEmployeeResponse response = employeeService.registerEmployee(employerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}