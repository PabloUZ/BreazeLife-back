package com.highdev.breazelife.modules.admin.exceptions;

public class AdminDashboardGraphsException extends AdminDashboardException {

    public AdminDashboardGraphsException(Throwable cause) {
        super(
                "ADMIN_DASHBOARD_GRAPHS_ERROR",
                "Failed to retrieve admin dashboard graphs",
                cause
        );
    }
}
