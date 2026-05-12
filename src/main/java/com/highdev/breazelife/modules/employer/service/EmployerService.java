package com.highdev.breazelife.modules.employer.service;

import com.highdev.breazelife.modules.employer.dto.response.EmployerProfileResponseDTO;
import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.employer.repository.EmployerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}