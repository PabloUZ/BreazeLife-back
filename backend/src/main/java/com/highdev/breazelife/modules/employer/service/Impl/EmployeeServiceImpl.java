package com.highdev.breazelife.modules.employer.service.Impl;

import com.highdev.breazelife.common.exceptions.http.BadRequestException;
import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.affiliate.repository.AffiliateRepository;
import com.highdev.breazelife.modules.contract.entity.Contract;
import com.highdev.breazelife.modules.contract.repository.ContractRepository;
import com.highdev.breazelife.modules.employer.dto.request.RegisterEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeContractRequest; // Inclusión del nuevo DTO
import com.highdev.breazelife.modules.employer.dto.response.EmployeeDetailResponse;
import com.highdev.breazelife.modules.employer.dto.response.ListEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.RegisterEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.UpdateEmployeeResponse;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.employer.service.EmployeeService;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // 2. Flujo Alternativo: Comprobar si el ciudadano ya existe en BreazeLife
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
            // Flujo normal: Es un usuario completamente nuevo
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("EMAIL_ALREADY_EXISTS",
                    "A user with email " + request.getEmail() + " already exists");
            }

            user = new User();
            user.setId(UUID.randomUUID().toString());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPassword(UUID.randomUUID().toString()); // Debería encriptarse en producción
            user.setRole(User.Role.AFFILIATE);
            user.setVerified(false);
            user = userRepository.save(user);

            affiliate = new Affiliate();
            affiliate.setUser(user);
            affiliate.setDocument(request.getDocument());
            affiliate.setBirthDate(request.getBirthDate());
            affiliate.setAffiliationDate(LocalDate.now());
            affiliate.setStatus(Affiliate.Status.ACTIVE);
            affiliate = affiliateRepository.save(affiliate);
        }

        // 3. Crear siempre el nuevo contrato laboral
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
    public EmployeeDetailResponse updateContractConditions(String employerId, String contractId, UpdateEmployeeContractRequest request) {
        
        // 1. Buscar el contrato verificando que pertenezca al empleador que lo solicita
        Contract contract = contractRepository.findByIdAndEmployerUserId(contractId, employerId)
            .orElseThrow(() -> new NotFoundException("EMPLOYEE_NOT_FOUND",
                "Contract not found or does not belong to this employer: " + contractId));

        // 2. Modificar parcialmente los datos contractuales/laborales
        if (request.getBaseSalary() != null) {
            contract.setBaseSalary(request.getBaseSalary());
        }
        if (request.getPosition() != null) {
            contract.setPosition(request.getPosition());
        }

        // 3. Guardar cambios en el repositorio del contrato
        contractRepository.save(contract);

        // 4. Mapear y retornar la información actualizada mediante EmployeeDetailResponse
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
}