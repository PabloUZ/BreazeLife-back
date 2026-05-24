package com.highdev.breazelife.modules.admin.dto.response;

import java.util.List;

public class AdminDashboardAlertsResponseDTO {
    private final List<AdminAlertItemDTO> alerts;

    public AdminDashboardAlertsResponseDTO(List<AdminAlertItemDTO> alerts) {
        this.alerts = alerts;
    }

    public List<AdminAlertItemDTO> getAlerts() {
        return alerts;
    }
}
