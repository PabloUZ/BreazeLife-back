package com.highdev.breazelife.modules.employer.dto.response;

import java.time.LocalDate;

public class DeactivateEmployeeResponse {

    private String contractId;
    private String affiliateId;
    private String employerId;
    private String firstName;
    private String lastName;
    private String status;
    private LocalDate endDate;

    public String getContractId() { return contractId; }
    public void setContractId(String contractId) { this.contractId = contractId; }

    public String getAffiliateId() { return affiliateId; }
    public void setAffiliateId(String affiliateId) { this.affiliateId = affiliateId; }

    public String getEmployerId() { return employerId; }
    public void setEmployerId(String employerId) { this.employerId = employerId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}