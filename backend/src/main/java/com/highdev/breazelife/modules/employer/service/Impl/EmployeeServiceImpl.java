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
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeContractRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.response.*;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.employer.service.EmployeeService;
import com.highdev.breazelife.modules.history.entity.UpdateHistory;
import com.highdev.breazelife.modules.history.repository.UpdateHistoryRepository;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final ContractRepository contractRepository;
    private final AffiliateRepository affiliateRepository;
    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;
    private final UpdateHistoryRepository updateHistoryRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(
        ContractRepository contractRepository,
        AffiliateRepository affiliateRepository,
        EmployerRepository employerRepository,
        UserRepository userRepository,
        UpdateHistoryRepository updateHistoryRepository,
        AccountRepository accountRepository,
        PasswordEncoder passwordEncoder) {
        this.contractRepository = contractRepository;
        this.affiliateRepository = affiliateRepository;
        this.employerRepository = employerRepository;
        this.userRepository = userRepository;
        this.updateHistoryRepository = updateHistoryRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public RegisterEmployeeResponse registerEmployee(String employerId, RegisterEmployeeRequest request) {

        // 1. Validar empleador
        Employer employer = employerRepository.findById(employerId)
            .orElseThrow(() -> new NotFoundException("EMPLOYER_NOT_FOUND",
                "Employer not found with id: " + employerId));

        if (employer.getStatus() != Employer.Status.ACTIVE) {
            throw new BadRequestException("EMPLOYER_NOT_ACTIVE",
                "Employer account is not active: " + employerId);
        }

        Affiliate affiliate;
        User user;

        // 2. Comprobar si el ciudadano ya existe en BreazeLife (Flujo Alternativo)
        Optional<Affiliate> existingAffiliate = affiliateRepository.findByDocument(request.getDocument());

        if (existingAffiliate.isPresent()) {
            affiliate = existingAffiliate.get();
            user = affiliate.getUser();

            // Evitar contratos duplicados activos con la misma empresa
            boolean hasActiveContract = contractRepository.findByIdAndEmployerUserId(affiliate.getUser().getId(), employerId).isPresent();
            if (hasActiveContract) {
                throw new BadRequestException("EMPLOYEE_ALREADY_CONTRACTED", 
                    "This employee already has an active contract with your company.");
            }
        } else {
            // Flujo normal: Es un usuario completamente nuevo en la plataforma
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("EMAIL_ALREADY_EXISTS",
                    "A user with email " + request.getEmail() + " already exists");
            }

            // Crear el usuario base usando las mejoras del equipo (password encriptada con documento)
            user = new User();
            user.setId(UUID.randomUUID().toString());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getDocument())); 
            user.setRole(User.Role.AFFILIATE);
            user.setVerified(false);
            user = userRepository.save(user);

            // Crear el afiliado (tomando la fecha de inicio enviada)
            affiliate = new Affiliate();
            affiliate.setUser(user);
            affiliate.setDocument(request.getDocument());
            affiliate.setBirthDate(request.getBirthDate());
            affiliate.setAffiliationDate(request.getStartDate());
            affiliate.setStatus(Affiliate.Status.ACTIVE);
            affiliate = affiliateRepository.save(affiliate);

            // Crear la cuenta pensional tomando el tipo enviado dinámicamente
            Account account = new Account();
            account.setAffiliate(affiliate);
            account.setAccountType(request.getPensionFundType());
            accountRepository.save(account);
        }

        // 3. Crear siempre el nuevo contrato laboral (Aplica para ambos flujos)
        Contract contract = new Contract();
        contract.setId(UUID.randomUUID().toString());
        contract.setAffiliate(affiliate);
        contract.setEmployer(employer);
        contract.setBaseSalary(request.getBaseSalary());
        contract.setPosition(request.getPosition());
        contract.setStartDate(request.getStartDate());
        contract = contractRepository.save(contract);

        // 4. Mapear Respuesta
        RegisterEmployeeResponse response = new RegisterEmployeeResponse();
        response.setContractId(contract.getId());
        response.setAffiliateId(user.getId());
        response.setEmployerId(employer.getUser().getId());
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
            response.setAffiliateId(contract.getAffiliate().getUser().getId());
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
        response.setAffiliateId(contract.getAffiliate().getUser().getId());
        response.setEmployerId(contract.getEmployer().getUser().getId());
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

        // Actualizar datos personales básicos
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        affiliate.setBirthDate(request.getBirthDate());
        
        // Guardar cambios explicitamente en las relaciones afectadas
        userRepository.save(user);
        affiliateRepository.save(affiliate);

        // Mapear respuesta con la información actualizada y permanente
        UpdateEmployeeResponse response = new UpdateEmployeeResponse();
        response.setContractId(contract.getId());
        response.setAffiliateId(user.getId());
        response.setEmployerId(contract.getEmployer().getUser().getId());
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

        // Registrar trazabilidad histórica en auditoría antes de mutar el registro principal
        UpdateHistory history = new UpdateHistory();
        history.setContract(contract);
        history.setDate(LocalDateTime.now());
        history.setAction("SALARY_POSITION_CHANGE");
        history.setPosition(request.getPosition());
        history.setSalary(request.getBaseSalary());
        updateHistoryRepository.save(history);

        // Mutar datos contractuales activos
        contract.setPosition(request.getPosition());
        contract.setBaseSalary(request.getBaseSalary());
        contractRepository.save(contract);

        ChangeSalaryPositionResponse response = new ChangeSalaryPositionResponse();
        response.setContractId(contract.getId());
        response.setAffiliateId(contract.getAffiliate().getUser().getId());
        response.setEmployerId(contract.getEmployer().getUser().getId());
        response.setFirstName(contract.getAffiliate().getUser().getFirstName());
        response.setLastName(contract.getAffiliate().getUser().getLastName());
        response.setPosition(contract.getPosition());
        response.setBaseSalary(contract.getBaseSalary());
        response.setStartDate(contract.getStartDate());
        response.setStatus(contract.getAffiliate().getStatus().name());

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SalaryHistoryResponse> getSalaryHistory(String employerId, String contractId, Pageable pageable) {
        Contract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new EntityNotFoundException("Contract not found"));

        if (!contract.getEmployer().getUser().getId().equals(employerId)) {
            throw new AccessDeniedException("Contract does not belong to this employer");
        }

        return updateHistoryRepository.findByContractIdOrderByDateDesc(contractId, pageable)
            .map(history -> {
                SalaryHistoryResponse response = new SalaryHistoryResponse();
                response.setHistoryId(String.valueOf(history.getId()));
                response.setContractId(history.getContract().getId());
                response.setDate(history.getDate());
                response.setAction(history.getAction());
                response.setPosition(history.getPosition());
                response.setSalary(history.getSalary());
                return response;
            });
    }

    @Override
    @Transactional
    public DeactivateEmployeeResponse deactivateEmployee(String employerId, String contractId) {
        Contract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new EntityNotFoundException("Contract not found"));

        if (!contract.getEmployer().getUser().getId().equals(employerId)) {
            throw new AccessDeniedException("Contract does not belong to this employer");
        }

        if (contract.getAffiliate().getStatus() == Affiliate.Status.INACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee is already inactive");
        }

        contract.getAffiliate().setStatus(Affiliate.Status.INACTIVE);
        contract.setEndDate(LocalDate.now());
        contractRepository.save(contract);

        Affiliate affiliate = contract.getAffiliate();
        User user = affiliate.getUser();

        DeactivateEmployeeResponse response = new DeactivateEmployeeResponse();
        response.setContractId(contract.getId());
        response.setAffiliateId(user.getId());
        response.setEmployerId(contract.getEmployer().getUser().getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setStatus(contract.getAffiliate().getStatus().name());
        response.setEndDate(contract.getEndDate());

        return response;
    }

    @Override
    public EmployeeDetailResponse updateContractConditions(String employerId, String contractId,
            UpdateEmployeeContractRequest request) {
        // Recuerda que en chats anteriores vimos que debes implementar este método
        // mapeando el DTO hacia las propiedades del contrato y del service.
        throw new UnsupportedOperationException("Unimplemented method 'updateContractConditions'");
    }
}