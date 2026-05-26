package com.highdev.breazelife.modules.employer.controller;

import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.employer.dto.request.ChangeSalaryPositionRequest;
import com.highdev.breazelife.modules.employer.dto.request.RegisterEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.response.*;
import com.highdev.breazelife.modules.employer.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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

    @PutMapping("/{employerId}/update-employee/{contractId}")
    public ResponseEntity<UpdateEmployeeResponse> updateEmployee(
        @PathVariable String employerId,
        @PathVariable String contractId,
        @Valid @RequestBody UpdateEmployeeRequest request) {

        UpdateEmployeeResponse response = employeeService.updateEmployee(employerId, contractId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{employerId}/change-salary-position/{contractId}")
    public ResponseEntity<ChangeSalaryPositionResponse> changeSalaryPosition(
        @PathVariable String employerId,
        @PathVariable String contractId,
        @Valid @RequestBody ChangeSalaryPositionRequest request) {

        ChangeSalaryPositionResponse response = employeeService.changeSalaryPosition(employerId, contractId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{employerId}/salary-history/{contractId}")
    @Operation(summary = "Get salary and position change history for a contract")
    public ResponseEntity<Page<SalaryHistoryResponse>> getSalaryHistory(
        @PathVariable String employerId,
        @PathVariable String contractId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<SalaryHistoryResponse> history = employeeService.getSalaryHistory(employerId, contractId, pageable);
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/{employerId}/desactivate-employee/{contractId}")
    @Operation(summary = "Deactivate an employee by contract ID")
    public ResponseEntity<DeactivateEmployeeResponse> deactivateEmployee(
        @PathVariable String employerId,
        @PathVariable String contractId) {

        DeactivateEmployeeResponse response = employeeService.deactivateEmployee(employerId, contractId);
        return ResponseEntity.ok(response);
    }

}