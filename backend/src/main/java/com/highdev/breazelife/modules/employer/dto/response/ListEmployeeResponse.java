package com.highdev.breazelife.modules.employer.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ListEmployeeResponse {
    private String contractId;
    private String affiliateId;
    private String firstName;
    private String lastName;
    private String document;
    private String position;
    private BigDecimal baseSalary;
    private LocalDate startDate;
    private String status;

    public String getContractId() { return contractId; }
    public void setContractId(String contractId) { this.contractId = contractId; }

    public String getAffiliateId() { return affiliateId; }
    public void setAffiliateId(String affiliateId) { this.affiliateId = affiliateId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getDocument() { return document; }
    public void setDocument(String document) { this.document = document; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
