package com.highdev.breazelife.modules.admin.dto.response;

import java.time.LocalDate;

public class AdminAccountDetailDto {
    private final String userId;
    private final String role;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final Boolean verified;
    private final String status;
    private final String suspendedReason;
    private final AffiliateInfo affiliate;
    private final EmployerInfo employer;

    public AdminAccountDetailDto(
            String userId,
            String role,
            String firstName,
            String lastName,
            String email,
            Boolean verified,
            String status,
            String suspendedReason,
            AffiliateInfo affiliate,
            EmployerInfo employer
    ) {
        this.userId = userId;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.verified = verified;
        this.status = status;
        this.suspendedReason = suspendedReason;
        this.affiliate = affiliate;
        this.employer = employer;
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

    public String getSuspendedReason() {
        return suspendedReason;
    }

    public AffiliateInfo getAffiliate() {
        return affiliate;
    }

    public EmployerInfo getEmployer() {
        return employer;
    }

    public static class AffiliateInfo {
        private final String document;
        private final LocalDate birthDate;
        private final String phoneNumber;
        private final LocalDate affiliationDate;

        public AffiliateInfo(String document, LocalDate birthDate, String phoneNumber, LocalDate affiliationDate) {
            this.document = document;
            this.birthDate = birthDate;
            this.phoneNumber = phoneNumber;
            this.affiliationDate = affiliationDate;
        }

        public String getDocument() {
            return document;
        }

        public LocalDate getBirthDate() {
            return birthDate;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public LocalDate getAffiliationDate() {
            return affiliationDate;
        }
    }

    public static class EmployerInfo {
        private final String nit;
        private final String companyName;
        private final String sector;
        private final String nameLegalRep;
        private final String idLegalRep;

        public EmployerInfo(String nit, String companyName, String sector, String nameLegalRep, String idLegalRep) {
            this.nit = nit;
            this.companyName = companyName;
            this.sector = sector;
            this.nameLegalRep = nameLegalRep;
            this.idLegalRep = idLegalRep;
        }

        public String getNit() {
            return nit;
        }

        public String getCompanyName() {
            return companyName;
        }

        public String getSector() {
            return sector;
        }

        public String getNameLegalRep() {
            return nameLegalRep;
        }

        public String getIdLegalRep() {
            return idLegalRep;
        }
    }
}
