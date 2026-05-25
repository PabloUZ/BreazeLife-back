package com.highdev.breazelife.modules.employer.dto.request;

import com.highdev.breazelife.modules.account.entity.Account;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RegisterEmployeeRequest {
    @NotBlank
    @Size(max = 30)
    private String firstName;

    @NotBlank
    @Size(max = 30)
    private String lastName;

    @NotBlank
    @Size(max = 255)
    private String email;

    @NotBlank
    @Pattern(regexp = "^[0-9]+$")
    @Size(max = 11)
    private String document;

    @NotNull
    @Past
    private LocalDate birthDate;

    @NotBlank
    @Size(max = 50)
    private String position;

    @NotNull
    @Positive
    private BigDecimal baseSalary;

    @NotNull
    private LocalDate startDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Account.AccountType pensionFundType;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDocument() { return document; }
    public void setDocument(String document) { this.document = document; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public Account.AccountType getPensionFundType() { return pensionFundType; }
    public void setPensionFundType(Account.AccountType pensionFundType) { this.pensionFundType = pensionFundType; }
}
