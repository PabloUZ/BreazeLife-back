package com.highdev.breazelife.modules.employer.service;

import com.highdev.breazelife.modules.employer.dto.request.RegisterEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.response.RegisterEmployeeResponse;

public interface EmployeeService {
    RegisterEmployeeResponse registerEmployee(String employerId, RegisterEmployeeRequest request);
}