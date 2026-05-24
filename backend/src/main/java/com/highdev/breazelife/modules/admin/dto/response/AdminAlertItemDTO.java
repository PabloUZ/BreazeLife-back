package com.highdev.breazelife.modules.admin.dto.response;

public class AdminAlertItemDTO {
    private final String type;
    private final String severity;
    private final String message;
    private final long count;

    public AdminAlertItemDTO(String type, String severity, String message, long count) {
        this.type = type;
        this.severity = severity;
        this.message = message;
        this.count = count;
    }

    public String getType() {
        return type;
    }

    public String getSeverity() {
        return severity;
    }

    public String getMessage() {
        return message;
    }

    public long getCount() {
        return count;
    }
}
