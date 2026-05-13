package com.highdev.breazelife.modules.employer.service;

import com.highdev.breazelife.modules.employer.dto.request.UpdateEmployerProfileDto;
import com.highdev.breazelife.modules.employer.dto.request.UpdateLegalRepresentativeDto;
import com.highdev.breazelife.modules.employer.dto.response.EmployerProfileResponseDTO;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployerService {

    @Autowired
    private EmployerRepository employerRepository;

    public EmployerProfileResponseDTO getProfile(String userId) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Employer not found with ID: " + userId));

        return new EmployerProfileResponseDTO(
                employer.getCompanyName(),
                employer.getNit(),
                employer.getSector(),
                employer.getNameLegalRep()
        );
    }

    @Transactional
    public EmployerProfileResponseDTO updateProfile(String userId, UpdateEmployerProfileDto dto) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));
        
        if (dto.getCompanyName() != null) employer.setCompanyName(dto.getCompanyName());
        if (dto.getSector() != null) employer.setSector(dto.getSector());
        
        return new EmployerProfileResponseDTO(employerRepository.save(employer));
    }

    @Transactional
    public EmployerProfileResponseDTO updateLegalRepresentative(String userId, UpdateLegalRepresentativeDto dto) {
        Employer employer = employerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));
        
        if (dto.getNameLegalRep() != null) employer.setNameLegalRep(dto.getNameLegalRep());
        if (dto.getIdLegalRep() != null) employer.setIdLegalRep(dto.getIdLegalRep());
        
        return new EmployerProfileResponseDTO(employerRepository.save(employer));
    }
}