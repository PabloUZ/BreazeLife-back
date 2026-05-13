package com.highdev.breazelife.modules.employer.dto.request;

import jakarta.validation.constraints.Size;

public class UpdateLegalRepresentativeDto {
    @Size(min = 2, max = 100)
    private String nameLegalRep = null;

    @Size(min = 5, max = 20)
    private String idLegalRep = null;

    public UpdateLegalRepresentativeDto() {}

    public String getNameLegalRep() { return nameLegalRep; }
    public void setNameLegalRep(String nameLegalRep) { this.nameLegalRep = nameLegalRep; }

    public String getIdLegalRep() { return idLegalRep; }
    public void setIdLegalRep(String idLegalRep) { this.idLegalRep = idLegalRep; }
}