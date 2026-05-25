package com.highdev.breazelife.modules.employer.service.Impl;

import com.highdev.breazelife.common.exceptions.http.BadRequestException;
import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.modules.account.entity.Account;
import com.highdev.breazelife.modules.account.repository.AccountRepository;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.affiliate.repository.AffiliateRepository;
import com.highdev.breazelife.modules.contract.entity.Contract;
import com.highdev.breazelife.modules.contract.repository.ContractRepository;
import com.highdev.breazelife.modules.employer.dto.request.ChangeSalaryPositionRequest;
import com.highdev.breazelife.modules.employer.dto.request.RegisterEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.response.ChangeSalaryPositionResponse;
import com.highdev.breazelife.modules.employer.dto.response.EmployeeDetailResponse;
import com.highdev.breazelife.modules.employer.dto.response.ListEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.RegisterEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.UpdateEmployeeResponse;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.employer.service.EmployeeService;
import com.highdev.breazelife.modules.history.entity.UpdateHistory;
import com.highdev.breazelife.modules.history.repository.UpdateHistoryRepository;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final UpdateHistoryRepository updateHistoryRepository;
    private final AccountRepository accountRepository;

    public EmployeeServiceImpl(
        ContractRepository contractRepository,
        AffiliateRepository affiliateRepository,
        EmployerRepository employerRepository,
        UserRepository userRepository,
        UpdateHistoryRepository updateHistoryRepository,
        AccountRepository accountRepository) {
        this.contractRepository = contractRepository;
        this.affiliateRepository = affiliateRepository;
        this.employerRepository = employerRepository;
        this.userRepository = userRepository;
        this.updateHistoryRepository = updateHistoryRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    @Transactional
    public RegisterEmployeeResponse registerEmployee(String employerId, RegisterEmployeeRequest request) {

        Employer employer = employerRepository.findById(employerId)
            .orElseThrow(() -> new NotFoundException("EMPLOYER_NOT_FOUND",
                "Employer not found with id: " + employerId));

        if (employer.getStatus() != Employer.Status.ACTIVE) {
            throw new NotFoundException("EMPLOYER_NOT_ACTIVE",
                "Employer account is not active: " + employerId);
        }

        if (affiliateRepository.existsByDocument(request.getDocument())) {
            throw new BadRequestException("DOCUMENT_ALREADY_EXISTS",
                "An employee with document " + request.getDocument() + " already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("EMAIL_ALREADY_EXISTS",
                "An user with email " + request.getEmail() + " already exists");
        }

        // Crear el usuario base
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(UUID.randomUUID().toString());
        user.setRole(User.Role.AFFILIATE);
        user.setVerified(false);
        user = userRepository.save(user);

        // Crear el afiliado
        Affiliate affiliate = new Affiliate();
        affiliate.setUser(user);
        affiliate.setDocument(request.getDocument());
        affiliate.setBirthDate(request.getBirthDate());
        affiliate.setAffiliationDate(request.getStartDate());
        affiliate.setStatus(Affiliate.Status.ACTIVE);
        affiliateRepository.save(affiliate);

        // Crear la cuenta pensional
        Account account = new Account();
        account.setAffiliate(affiliate);
        account.setAccountType(request.getPensionFundType());
        accountRepository.save(account);

        // Crear el contrato
        Contract contract = new Contract();
        contract.setId(UUID.randomUUID().toString());
        contract.setAffiliate(affiliate);
        contract.setEmployer(employer);
        contract.setBaseSalary(request.getBaseSalary());
        contract.setPosition(request.getPosition());
        contract.setStartDate(request.getStartDate());
        contractRepository.save(contract);

        // Construir respuesta
        RegisterEmployeeResponse response = new RegisterEmployeeResponse();
        response.setContractId(contract.getId());
        response.setAffiliateId(affiliate.getUserId());
        response.setEmployerId(employer.getUserId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setDocument(affiliate.getDocument());
        response.setBirthDate(affiliate.getBirthDate());
        response.setPosition(contract.getPosition());
        response.setBaseSalary(contract.getBaseSalary());
        response.setStartDate(contract.getStartDate());
        response.setStatus(affiliate.getStatus().name());
        response.setCreatedAt(LocalDateTime.now());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ListEmployeeResponse> listEmployees(String employerId, Affiliate.Status status, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Contract> contracts;

        if (status != null) {
            contracts = contractRepository.findByEmployerUserIdAndAffiliateStatus(employerId, status, pageable);
        } else {
            contracts = contractRepository.findByEmployerUserId(employerId, pageable);
        }

        return contracts.map(contract -> {
            ListEmployeeResponse response = new ListEmployeeResponse();
            response.setContractId(contract.getId());
            response.setAffiliateId(contract.getAffiliate().getUserId());
            response.setFirstName(contract.getAffiliate().getUser().getFirstName());
            response.setLastName(contract.getAffiliate().getUser().getLastName());
            response.setDocument(contract.getAffiliate().getDocument());
            response.setPosition(contract.getPosition());
            response.setBaseSalary(contract.getBaseSalary());
            response.setStartDate(contract.getStartDate());
            response.setStatus(contract.getAffiliate().getStatus().name());
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDetailResponse getEmployeeDetail(String employerId, String contractId) {

        Contract contract = contractRepository.findByIdAndEmployerUserId(contractId, employerId)
            .orElseThrow(() -> new NotFoundException("EMPLOYEE_NOT_FOUND",
                "Employee not found with contract id: " + contractId));

        EmployeeDetailResponse response = new EmployeeDetailResponse();
        response.setContractId(contract.getId());
        response.setAffiliateId(contract.getAffiliate().getUserId());
        response.setEmployerId(contract.getEmployer().getUserId());
        response.setCompanyName(contract.getEmployer().getCompanyName());
        response.setFirstName(contract.getAffiliate().getUser().getFirstName());
        response.setLastName(contract.getAffiliate().getUser().getLastName());
        response.setEmail(contract.getAffiliate().getUser().getEmail());
        response.setDocument(contract.getAffiliate().getDocument());
        response.setBirthDate(contract.getAffiliate().getBirthDate());
        response.setPosition(contract.getPosition());
        response.setBaseSalary(contract.getBaseSalary());
        response.setStartDate(contract.getStartDate());
        response.setEndDate(contract.getEndDate());
        response.setStatus(contract.getAffiliate().getStatus().name());
        return response;
    }

    @Override
    @Transactional
    public UpdateEmployeeResponse updateEmployee(String employerId, String contractId, UpdateEmployeeRequest request) {

        Contract contract = contractRepository.findByIdAndEmployerUserId(contractId, employerId)
            .orElseThrow(() -> new NotFoundException("EMPLOYEE_NOT_FOUND",
                "Employee not found with contract id: " + contractId));

        Affiliate affiliate = contract.getAffiliate();
        User user = affiliate.getUser();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        affiliate.setBirthDate(request.getBirthDate());

        UpdateEmployeeResponse response = new UpdateEmployeeResponse();
        response.setContractId(contract.getId());
        response.setAffiliateId(affiliate.getUserId());
        response.setEmployerId(contract.getEmployer().getUserId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setDocument(affiliate.getDocument());
        response.setBirthDate(affiliate.getBirthDate());
        response.setPosition(contract.getPosition());
        response.setBaseSalary(contract.getBaseSalary());
        response.setStartDate(contract.getStartDate());
        response.setStatus(affiliate.getStatus().name());

        return response;
    }

    @Override
    @Transactional
    public ChangeSalaryPositionResponse changeSalaryPosition(String employerId, String contractId, ChangeSalaryPositionRequest request) {

        Contract contract = contractRepository.findByIdAndEmployerUserId(contractId, employerId)
            .orElseThrow(() -> new NotFoundException("CONTRACT_NOT_FOUND",
                "Contract not found with id: " + contractId));

        UpdateHistory history = new UpdateHistory();
        history.setContract(contract);
        history.setDate(LocalDateTime.now());
        history.setAction("SALARY_POSITION_CHANGE");
        history.setPosition(request.getPosition());
        history.setSalary(request.getBaseSalary());
        updateHistoryRepository.save(history);

        contract.setPosition(request.getPosition());
        contract.setBaseSalary(request.getBaseSalary());

        ChangeSalaryPositionResponse response = new ChangeSalaryPositionResponse();
        response.setContractId(contract.getId());
        response.setAffiliateId(contract.getAffiliate().getUserId());
        response.setEmployerId(contract.getEmployer().getUserId());
        response.setFirstName(contract.getAffiliate().getUser().getFirstName());
        response.setLastName(contract.getAffiliate().getUser().getLastName());
        response.setPosition(contract.getPosition());
        response.setBaseSalary(contract.getBaseSalary());
        response.setStartDate(contract.getStartDate());
        response.setStatus(contract.getAffiliate().getStatus().name());

        return response;
    }
}