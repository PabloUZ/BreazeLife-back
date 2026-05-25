package com.highdev.breazelife.modules.employer.service;

import com.highdev.breazelife.common.exceptions.http.NotFoundException;
import com.highdev.breazelife.modules.affiliate.entity.Affiliate;
import com.highdev.breazelife.modules.employer.dto.request.RegisterEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeRequest;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployerProfileDTO;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployerRepresentativeDTO;
import com.highdev.breazelife.modules.employer.dto.request.UpdateLegalRepresentativeDto;
import com.highdev.breazelife.modules.employer.dto.response.EmployerProfileResponseDTO;
import com.highdev.breazelife.modules.employer.dto.response.ListEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.RegisterEmployeeResponse;
import com.highdev.breazelife.modules.employer.dto.response.UpdateEmployeeResponse;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.employer.service.EmployeeService;
import com.highdev.breazelife.modules.fund.service.FundsService;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployerService {

    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;
    private final FundsService fundsService;
    private final EmployeeService employeeService;

    // Constructor único con todas las dependencias necesarias inyectadas por Spring
    public EmployerService(EmployerRepository employerRepository, 
                           UserRepository userRepository, 
                           FundsService fundsService,
                           EmployeeService employeeService) {
        this.employerRepository = employerRepository;
        this.userRepository = userRepository;
        this.fundsService = fundsService;
        this.employeeService = employeeService;
    }

    @Transactional
    public void createEmptyProfile(String userId) {
        Employer employer = new Employer();
        User userProxy = userRepository.getReferenceById(userId);
        
        employer.setUser(userProxy); // Hibernate usará el ID de este proxy automáticamente
        
        // Asignación de valores por defecto para evitar restricciones NOT NULL en la BD
        employer.setCompanyName("Por completar");
        employer.setSector("Por definir");
        employer.setNit("000000000-0"); 
        employer.setNameLegalRep("Por completar");
        employer.setIdLegalRep("0000000000");

        employerRepository.save(employer);
        
        // Inicializar fondos automáticamente cuando se crea el employer
        fundsService.initializeFunds(userId);
    }

    @Transactional(readOnly = true)
    public EmployerProfileResponseDTO getProfile(String userId) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("EMPLOYER_NOT_FOUND", 
                    "Employer not found with ID: " + userId));
        return new EmployerProfileResponseDTO(employer);
    }

    @Transactional
    public EmployerProfileResponseDTO updateLegalRepresentative(String userId, UpdateEmployerRepresentativeDTO dto) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("EMPLOYER_NOT_FOUND", 
                    "Employer not found with ID: " + userId));
        
        System.out.println("=== DEPURACIÓN ENDPOINT ===");
        System.out.println("NIT en el DTO: " + dto.getNit());
        System.out.println("==========================");
        
        if (dto.getNit() != null) employer.setNit(dto.getNit());
        if (dto.getNameLegalRep() != null) employer.setNameLegalRep(dto.getNameLegalRep());
        if (dto.getIdLegalRep() != null) employer.setIdLegalRep(dto.getIdLegalRep());
        
        return new EmployerProfileResponseDTO(employerRepository.save(employer));
    }

    @Transactional
    public EmployerProfileResponseDTO updateProfile(String userId, UpdateEmployerProfileDTO dto) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("EMPLOYER_NOT_FOUND", 
                    "Employer not found with ID: " + userId));
        
        if (dto.getCompanyName() != null) employer.setCompanyName(dto.getCompanyName());
        if (dto.getSector() != null) employer.setSector(dto.getSector());
        
        return new EmployerProfileResponseDTO(employerRepository.save(employer));
    }

    @Transactional
    public void deleteProfile(String userId) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("EMPLOYER_NOT_FOUND", 
                    "Employer not found with ID: " + userId));
        employerRepository.delete(employer);
    }

    /**
     * 🚀 MÉTODO CORREGIDO: Lista los empleados vinculados a la empresa.
     * Mapeado directamente con la paginación real de EmployeeServiceImpl.
     */
    @Transactional(readOnly = true)
    public Page<ListEmployeeResponse> getCompanyEmployees(String userId, Affiliate.Status status, int page, int size) {
        // Validamos primero que el empleador exista en la base de datos antes de pedir sus contratos
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("EMPLOYER_NOT_FOUND", 
                    "Employer not found with ID: " + userId));
        
        // Delegamos al servicio de empleados pasando el userId (que actúa como id del empleador) y los datos de paginación
        return employeeService.listEmployees(employer.getUserId(), status, page, size);
    }

    @Transactional
    public RegisterEmployeeResponse registerEmployee(String userId, RegisterEmployeeRequest dto) {
        // Aseguramos que el empleador exista con el ID del token antes de proceder
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("EMPLOYER_NOT_FOUND", 
                    "Employer not found with ID: " + userId));
        
        return employeeService.registerEmployee(employer.getUserId(), dto);
    }


    @Transactional
    public UpdateEmployeeResponse updateEmployee(String userId, String contractId, UpdateEmployeeRequest dto) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("EMPLOYER_NOT_FOUND", 
                    "Employer not found with ID: " + userId));
        
        return employeeService.updateEmployee(employer.getUserId(), contractId, dto);
    }

    @Transactional(readOnly = true)
    public com.highdev.breazelife.modules.employer.dto.response.EmployeeDetailResponse getEmployeeDetail(String userId, String contractId) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("EMPLOYER_NOT_FOUND", 
                    "Employer not found with ID: " + userId));
        
        // Pasamos el ID real de la empresa (employer.getUserId()) y el ID del contrato
        return employeeService.getEmployeeDetail(employer.getUserId(), contractId);
    }

    @Transactional
    public com.highdev.breazelife.modules.employer.dto.response.EmployeeDetailResponse updateContractConditions(
            String userId, String contractId, com.highdev.breazelife.modules.employer.dto.request.UpdateEmployeeContractRequest dto) {
        
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("EMPLOYER_NOT_FOUND", 
                    "Employer not found with ID: " + userId));
        
        // Delegamos al servicio de empleados la persistencia en la tabla/entidad de contratos
        return employeeService.updateContractConditions(employer.getUserId(), contractId, dto);
    }
}