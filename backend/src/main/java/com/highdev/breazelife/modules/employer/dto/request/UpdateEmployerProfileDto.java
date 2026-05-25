package com.highdev.breazelife.modules.employer.dto.request;

import jakarta.validation.constraints.Size;

public class UpdateEmployerProfileDto {
    @Size(min = 2, max = 100)
    private String companyName = null;

    @Size(min = 2, max = 50)
    private String sector = null;

    public UpdateEmployerProfileDto() {}

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
}