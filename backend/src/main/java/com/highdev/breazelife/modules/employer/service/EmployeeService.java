package com.highdev.breazelife.modules.employer.service;

import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.employer.dto.request.ChangeSalaryPositionRequest;
import com.highdev.breazelife.modules.employer.dto.request.RegisterEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeContractRequest;
import com.highdev.breazelife.modules.employer.dto.response.EmployeeDetailResponse;
import com.highdev.breazelife.modules.employer.dto.response.ListEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.RegisterEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.UpdateEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.ChangeSalaryPositionResponse; // <--- Importación corregida
import com.highdev.breazelife.modules.employer.dto.response.SalaryHistoryResponse;       // <--- Importación corregida
import com.highdev.breazelife.modules.employer.dto.response.DeactivateEmployeeResponse;   // <--- Importación corregida
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {
    
    RegisterEmployeeResponse registerEmployee(String employerId, RegisterEmployeeRequest request);
    
    Page<ListEmployeeResponse> listEmployees(String employerId, Affiliate.Status status, int page, int size);
    
    EmployeeDetailResponse getEmployeeDetail(String employerId, String contractId);
    
    UpdateEmployeeResponse updateEmployee(String employerId, String contractId, UpdateEmployeeRequest request);
    
    EmployeeDetailResponse updateContractConditions(String employerId, String contractId, UpdateEmployeeContractRequest request);
    
    ChangeSalaryPositionResponse changeSalaryPosition(String employerId, String contractId, ChangeSalaryPositionRequest request);
    
    Page<SalaryHistoryResponse> getSalaryHistory(String employerId, String contractId, Pageable pageable);
    
    DeactivateEmployeeResponse deactivateEmployee(String employerId, String contractId);
}