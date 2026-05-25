package com.highdev.breazelife.modules.employer.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;

public class UpdateEmployerProfileDto {

    @Size(min = 2, max = 50)
    @JsonProperty("companyName")
    private String companyName = null;

    @Size(min = 2, max = 100)
    @JsonProperty("sector")
    private String sector = null;

    public UpdateEmployerProfileDto() {}

    @JsonProperty("companyName")
    public String getCompanyName() { return companyName; }

    @JsonProperty("companyName")
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    @JsonProperty("sector")
    public String getSector() { return sector; }

    @JsonProperty("sector")
    public void setSector(String sector) { this.sector = sector; }
}
