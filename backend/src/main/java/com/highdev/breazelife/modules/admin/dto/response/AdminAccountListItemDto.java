package com.highdev.breazelife.modules.admin.dto.response;

public class AdminAccountListItemDto {
    private final String userId;
    private final String role;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final Boolean verified;
    private final String status;
    private final String document;
    private final String nit;
    private final String companyName;

    public AdminAccountListItemDto(
            String userId,
            String role,
            String firstName,
            String lastName,
            String email,
            Boolean verified,
            String status,
            String document,
            String nit,
            String companyName
    ) {
        this.userId = userId;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.verified = verified;
        this.status = status;
        this.document = document;
        this.nit = nit;
        this.companyName = companyName;
    }

    public String getUserId() {
        return userId;
    }

    public String getRole() {
        return role;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public Boolean getVerified() {
        return verified;
    }

    public String getStatus() {
        return status;
    }

    public String getDocument() {
        return document;
    }

    public String getNit() {
        return nit;
    }

    public String getCompanyName() {
        return companyName;
    }
}
