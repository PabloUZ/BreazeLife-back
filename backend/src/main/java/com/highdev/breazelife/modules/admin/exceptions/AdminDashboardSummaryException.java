package com.highdev.breazelife.modules.admin.exceptions;

public class AdminDashboardSummaryException extends AdminDashboardException {

    public AdminDashboardSummaryException(Throwable cause) {
        super(
                "ADMIN_DASHBOARD_SUMMARY_ERROR",
                "Failed to retrieve admin dashboard summary",
                cause
        );
    }
}
