package com.highdev.breazelife.modules.admin.dto.response;

public class QuoteStatusGraphDTO {
    private final String status;
    private final Long count;

    public QuoteStatusGraphDTO(String status, Long count) {
        this.status = status;
        this.count = count;
    }

    public String getStatus() {
        return status;
    }

    public Long getCount() {
        return count;
    }
}
