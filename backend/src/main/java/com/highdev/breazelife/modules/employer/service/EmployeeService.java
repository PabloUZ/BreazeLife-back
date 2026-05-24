package com.highdev.breazelife.modules.employer.service;

import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.employer.dto.request.RegisterEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.response.EmployeeDetailResponse;
import com.highdev.breazelife.modules.employer.dto.response.ListEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.RegisterEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.UpdateEmployeeResponse;
import org.springframework.data.domain.Page;

public interface EmployeeService {
    RegisterEmployeeResponse registerEmployee(String employerId, RegisterEmployeeRequest request);
    Page<ListEmployeeResponse> listEmployees(String employerId, Affiliate.Status status, int page, int size);
    EmployeeDetailResponse getEmployeeDetail(String employerId, String contractId);
    UpdateEmployeeResponse updateEmployee(String employerId, String contractId, UpdateEmployeeRequest request);
}