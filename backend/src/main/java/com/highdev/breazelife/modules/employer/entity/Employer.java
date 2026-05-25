package com.highdev.breazelife.modules.employer.entity;

import com.highdev.breazelife.modules.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "employers")
public class Employer {

    @Id
    @Column(name = "user_id", length = 36)
    private String userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 20, unique = true)
    private String nit;

    @Column(name = "company_name", length = 50)
    private String companyName;

    @Column(length = 100)
    private String sector;

    @Column(name = "name_legal_rep", length = 50)
    private String nameLegalRep;

    @Column(name = "id_legal_rep", length = 20)
    private String idLegalRep;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @Column(name = "suspended_reason", columnDefinition = "TEXT")
    private String suspendedReason;

    public enum Status {
        ACTIVE, SUSPENDED, INACTIVE
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getNit() { return nit; }
    public void setNit(String nit) { this.nit = nit; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getNameLegalRep() { return nameLegalRep; }
    public void setNameLegalRep(String nameLegalRep) { this.nameLegalRep = nameLegalRep; }

    public String getIdLegalRep() { return idLegalRep; }
    public void setIdLegalRep(String idLegalRep) { this.idLegalRep = idLegalRep; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getSuspendedReason() { return suspendedReason; }
    public void setSuspendedReason(String suspendedReason) { this.suspendedReason = suspendedReason; }
}
