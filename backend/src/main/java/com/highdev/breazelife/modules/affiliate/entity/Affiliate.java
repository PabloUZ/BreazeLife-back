package com.highdev.breazelife.modules.affiliate.entity;

import com.highdev.breazelife.modules.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "affiliates")
public class Affiliate {

    @Id
    @Column(name = "user_id", length = 36)
    private String userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 20, unique = true, nullable = false)
    private String document;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "phone_number", length = 15, unique = true)
    private String phoneNumber;

    @Column(name = "affiliation_date")
    private LocalDate affiliationDate;

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

    public String getDocument() { return document; }
    public void setDocument(String document) { this.document = document; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public LocalDate getAffiliationDate() { return affiliationDate; }
    public void setAffiliationDate(LocalDate affiliationDate) { this.affiliationDate = affiliationDate; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getSuspendedReason() { return suspendedReason; }
    public void setSuspendedReason(String suspendedReason) { this.suspendedReason = suspendedReason; }
}
