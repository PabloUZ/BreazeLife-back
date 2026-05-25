package com.highdev.breazelife.modules.admin.exceptions;

public class AdminDashboardAlertsException extends AdminDashboardException {

    public AdminDashboardAlertsException(Throwable cause) {
        super(
                "ADMIN_DASHBOARD_ALERTS_ERROR",
                "Failed to retrieve admin dashboard alerts",
                cause
        );
    }
}
