package com.highdev.breazelife.modules.employer.service;

import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployerProfileDTO;
import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployerRepresentativeDTO;
import com.highdev.breazelife.modules.employer.dto.response.EmployerProfileResponseDTO;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import com.highdev.breazelife.modules.fund.service.FundsService;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployerService {

    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;
    private final FundsService fundsService;

    public EmployerService(EmployerRepository employerRepository, UserRepository userRepository, FundsService fundsService) {
        this.employerRepository = employerRepository;
        this.userRepository = userRepository;
        this.fundsService = fundsService;
    }

    @Transactional
    public void createEmptyProfile(String userId) {
        Employer employer = new Employer();
        User userProxy = userRepository.getReferenceById(userId);
        
        employer.setUser(userProxy); // Hibernate usará el ID de este proxy automáticamente
        
        // Asignación de valores por defecto para evitar restricciones NOT NULL en la BD
        employer.setCompanyName("Por completar");
        employer.setSector("Por definir");
        employer.setNit("000000000-0"); // O el formato de placeholder que prefieras
        employer.setNameLegalRep("Por completar");
        employer.setIdLegalRep("0000000000");
        
        // Inicialización de saldos en cero (fondos obligatorios del negocio para BreazeLife)
        // employer.setPayrollFundBalance(BigDecimal.ZERO); 
        // employer.setContributionFundBalance(BigDecimal.ZERO);

        employerRepository.save(employer);
        
        // Inicializar fondos automáticamente cuando se crea el employer
        fundsService.initializeFunds(userId);
    }

    

    @Transactional(readOnly = true)
    public EmployerProfileResponseDTO getProfile(String userId) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Employer not found with ID: " + userId));
        return new EmployerProfileResponseDTO(employer);
    }

    @Transactional
    public EmployerProfileResponseDTO updateProfile(String userId, UpdateEmployerProfileDTO dto) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Employer not found with ID: " + userId));
        
        if (dto.getCompanyName() != null) employer.setCompanyName(dto.getCompanyName());
        if (dto.getSector() != null) employer.setSector(dto.getSector());
        
        return new EmployerProfileResponseDTO(employerRepository.save(employer));
    }

    @Transactional
    public EmployerProfileResponseDTO updateLegalRepresentative(String userId, UpdateEmployerRepresentativeDTO dto) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Employer not found with ID: " + userId));
        
        if (dto.getNameLegalRep() != null) employer.setNameLegalRep(dto.getNameLegalRep());
        if (dto.getIdLegalRep() != null) employer.setIdLegalRep(dto.getIdLegalRep());
        
        return new EmployerProfileResponseDTO(employerRepository.save(employer));
    }

    // ELIMINACIÓN
    @Transactional
    public void deleteProfile(String userId) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Employer not found with ID: " + userId));
        employerRepository.delete(employer);
    }
}