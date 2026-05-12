package com.highdev.breazelife.modules.employer.service.Impl;

import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.affiliate.repository.AffiliateRepository;
import com.highdev.breazelife.modules.contract.entity.Contract;
import com.highdev.breazelife.modules.contract.repository.ContractRepository;
import com.highdev.breazelife.modules.employer.dto.request.RegisterEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.response.RegisterEmployeeResponse;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.exceptions.DocumentAlreadyExistsException;
import com.highdev.breazelife.modules.employer.exceptions.EmailAlreadyExistsException;
import com.highdev.breazelife.modules.employer.exceptions.EmployerNotFoundException;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.employer.service.EmployeeService;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final ContractRepository contractRepository;
    private final AffiliateRepository affiliateRepository;
    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;

    public EmployeeServiceImpl(
        ContractRepository contractRepository,
        AffiliateRepository affiliateRepository,
        EmployerRepository employerRepository,
        UserRepository userRepository) {
        this.contractRepository = contractRepository;
        this.affiliateRepository = affiliateRepository;
        this.employerRepository = employerRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public RegisterEmployeeResponse registerEmployee(String employerId, RegisterEmployeeRequest request) {

        // reemplazar con lógica real cuando affiliate y contract estén disponibles
        RegisterEmployeeResponse response = new RegisterEmployeeResponse();
        response.setContractId(UUID.randomUUID().toString());
        response.setAffiliateId(UUID.randomUUID().toString());
        response.setEmployerId(employerId);
        response.setFirstName(request.getFirstName());
        response.setLastName(request.getLastName());
        response.setEmail(request.getEmail());
        response.setDocument(request.getDocument());
        response.setBirthDate(request.getBirthDate());
        response.setPosition(request.getPosition());
        response.setBaseSalary(request.getBaseSalary());
        response.setStartDate(request.getStartDate());
        response.setStatus("ACTIVE");
        response.setCreatedAt(LocalDateTime.now());
        return response;
    }
}