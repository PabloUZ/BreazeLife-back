package com.highdev.breazelife.modules.employer.controller;

import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.employer.dto.request.RegisterEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.response.EmployeeDetailResponse;
import com.highdev.breazelife.modules.employer.dto.response.ListEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.RegisterEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.UpdateEmployeeResponse;
import com.highdev.breazelife.modules.employer.service.EmployeeService;
import com.highdev.breazelife.modules.user.entity.User;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employers")
@PreAuthorize("hasRole('EMPLOYER')")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping("/new-employee")
    public ResponseEntity<RegisterEmployeeResponse> registerEmployee(
        @AuthenticationPrincipal User authenticatedUser,
        @Valid @RequestBody RegisterEmployeeRequest request) {

        String employerId = authenticatedUser.getId();
        RegisterEmployeeResponse response = employeeService.registerEmployee(employerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/list-employees")
    public ResponseEntity<Page<ListEmployeeResponse>> listEmployees(
        @AuthenticationPrincipal User authenticatedUser,
        @RequestParam(required = false) Affiliate.Status status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {

        String employerId = authenticatedUser.getId();
        Page<ListEmployeeResponse> response = employeeService.listEmployees(employerId, status, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employee-detail/{contractId}")
    public ResponseEntity<EmployeeDetailResponse> getEmployeeDetail(
        @AuthenticationPrincipal User authenticatedUser,
        @PathVariable String contractId){

        String employerId = authenticatedUser.getId();
        EmployeeDetailResponse response = employeeService.getEmployeeDetail(employerId, contractId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-employee/{contractId}")
    public ResponseEntity<UpdateEmployeeResponse> updateEmployee(
        @AuthenticationPrincipal User authenticatedUser,
        @PathVariable String contractId,
        @Valid @RequestBody UpdateEmployeeRequest request) {

        String employerId = authenticatedUser.getId();
        UpdateEmployeeResponse response = employeeService.updateEmployee(employerId, contractId, request);
        return ResponseEntity.ok(response);
    }
}