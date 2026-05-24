package com.highdev.breazelife.modules.admin.dto.response;

public class AdminAccountActionResponseDto {
    private final String userId;
    private final String role;
    private final Boolean verified;
    private final String status;
    private final String suspendedReason;

    public AdminAccountActionResponseDto(
            String userId,
            String role,
            Boolean verified,
            String status,
            String suspendedReason
    ) {
        this.userId = userId;
        this.role = role;
        this.verified = verified;
        this.status = status;
        this.suspendedReason = suspendedReason;
    }

    public String getUserId() {
        return userId;
    }

    public String getRole() {
        return role;
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
}
