package com.highdev.breazelife.modules.employer.controller;

import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.employer.dto.request.RegisterEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.response.EmployeeDetailResponse;
import com.highdev.breazelife.modules.employer.dto.response.ListEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.RegisterEmployeeResponse;
import com.highdev.breazelife.modules.employer.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employers")
@PreAuthorize("hasRole('EMPLOYER')")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping("/{employerId}/new-employee")
    public ResponseEntity<RegisterEmployeeResponse> registerEmployee(
        @PathVariable String employerId,
        @Valid @RequestBody RegisterEmployeeRequest request) {

        RegisterEmployeeResponse response = employeeService.registerEmployee(employerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{employerId}/list-employees")
    public ResponseEntity<Page<ListEmployeeResponse>> listEmployees(
        @PathVariable String employerId,
        @RequestParam(required = false) Affiliate.Status status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {

        Page<ListEmployeeResponse> response = employeeService.listEmployees(employerId, status, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{employerId}/employee-detail/{contractId}")
    public ResponseEntity<EmployeeDetailResponse> getEmployeeDetail(
        @PathVariable String employerId,
        @PathVariable String contractId){

        EmployeeDetailResponse response = employeeService.getEmployeeDetail(employerId, contractId);
        return ResponseEntity.ok(response);
    }
}