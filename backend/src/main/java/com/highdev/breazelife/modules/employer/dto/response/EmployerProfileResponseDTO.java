package com.highdev.breazelife.modules.employer.dto.response;

import com.highdev.breazelife.modules.employer.entity.Employer;

public class EmployerProfileResponseDTO {
    private String companyName;
    private String nit;
    private String sector;
    private String nameLegalRep;

    public EmployerProfileResponseDTO() {}

    public EmployerProfileResponseDTO(String companyName, String nit, String sector, String nameLegalRep) {
        this.companyName = companyName;
        this.nit = nit;
        this.sector = sector;
        this.nameLegalRep = nameLegalRep;
    }

    public EmployerProfileResponseDTO(Employer employer) {
        this.companyName = employer.getCompanyName();
        this.nit = employer.getNit();
        this.sector = employer.getSector();
        this.nameLegalRep = employer.getNameLegalRep();
    }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getNit() { return nit; }
    public void setNit(String nit) { this.nit = nit; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getNameLegalRep() { return nameLegalRep; }
    public void setNameLegalRep(String nameLegalRep) { this.nameLegalRep = nameLegalRep; }
}