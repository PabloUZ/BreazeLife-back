package com.highdev.breazelife.modules.admin.dto.response;

import java.math.BigDecimal;

public class AdminDashboardSummaryResponseDTO {
    private long activeAffiliates;
    private long activeEmployers;
    private long pendingContributions;
    private BigDecimal managedBalance;
    private BigDecimal monthlyContributions;

    public AdminDashboardSummaryResponseDTO(
            long activeAffiliates,
            long activeEmployers,
            long pendingContributions,
            BigDecimal managedBalance,
            BigDecimal monthlyContributions
    ) {
        this.activeAffiliates = activeAffiliates;
        this.activeEmployers = activeEmployers;
        this.pendingContributions = pendingContributions;
        this.managedBalance = managedBalance;
        this.monthlyContributions = monthlyContributions;
    }

    public long getActiveAffiliates() {
        return activeAffiliates;
    }

    public long getActiveEmployers() {
        return activeEmployers;
    }

    public long getPendingContributions() {
        return pendingContributions;
    }

    public BigDecimal getManagedBalance() {
        return managedBalance;
    }

    public BigDecimal getMonthlyContributions() {
        return monthlyContributions;
    }
}
