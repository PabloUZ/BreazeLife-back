package com.highdev.breazelife.modules.employer.dto.response;

import com.highdev.breazelife.modules.employer.entity.Employer;
import com.highdev.breazelife.modules.user.entity.User;

public class EmployerProfileResponseDTO {
    private String userId;
    private String email;
    private String role; 
    // --- Datos Específicos de la Empresa (Employer) ---
    private String companyName;
    private String nit;
    private String sector;
    private String nameLegalRep;

    public EmployerProfileResponseDTO() {}

    public EmployerProfileResponseDTO(String userId, String email, String role, String companyName, String nit, String sector, String nameLegalRep) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.companyName = companyName;
        this.nit = nit;
        this.sector = sector;
        this.nameLegalRep = nameLegalRep;
    }

    public EmployerProfileResponseDTO(Employer employer) {
        if (employer.getUser() != null) {
            User user = employer.getUser();
            this.userId = user.getId();
            this.email = user.getEmail();
            this.role = user.getRole() != null ? user.getRole().toString() : null; // Adapta según tu campo de rol
        }
        
        this.companyName = employer.getCompanyName();
        this.nit = employer.getNit();
        this.sector = employer.getSector();
        this.nameLegalRep = employer.getNameLegalRep();
    }
    

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getNit() { return nit; }
    public void setNit(String nit) { this.nit = nit; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getNameLegalRep() { return nameLegalRep; }
    public void setNameLegalRep(String nameLegalRep) { this.nameLegalRep = nameLegalRep; }
}