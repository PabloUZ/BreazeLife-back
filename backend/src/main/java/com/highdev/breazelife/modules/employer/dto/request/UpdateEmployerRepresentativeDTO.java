package com.highdev.breazelife.modules.employer.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;

public class UpdateEmployerRepresentativeDTO {

    @Size(min = 2, max = 100)
    @JsonProperty("nameLegalRep")
    private String nameLegalRep = null;

    @Size(min = 5, max = 20)
    @JsonProperty("idLegalRep")
    private String idLegalRep = null;

    @Size(min = 7, max = 20)
    @JsonProperty("nit") // Asegura el mapeo de la variable
    private String nit = null;

    public UpdateEmployerRepresentativeDTO() {}

    @JsonProperty("nameLegalRep")
    public String getNameLegalRep() { return nameLegalRep; }
    
    @JsonProperty("nameLegalRep")
    public void setNameLegalRep(String nameLegalRep) { this.nameLegalRep = nameLegalRep; }

    @JsonProperty("idLegalRep")
    public String getIdLegalRep() { return idLegalRep; }
    
    @JsonProperty("idLegalRep")
    public void setIdLegalRep(String idLegalRep) { this.idLegalRep = idLegalRep; }

    @JsonProperty("nit") // Énfasis explícito en el Getter para la respuesta
    public String getNit() { return nit; }
    
    @JsonProperty("nit") // Énfasis explícito en el Setter para la lectura del JSON entrante
    public void setNit(String nit) { this.nit = nit; }
}