package com.highdev.breazelife.modules.admin.dto.response;

public class AffiliateFundTypeGraphDTO {
    private final String fundType;
    private final Long count;

    public AffiliateFundTypeGraphDTO(String fundType, Long count) {
        this.fundType = fundType;
        this.count = count;
    }

    public String getFundType() {
        return fundType;
    }

    public Long getCount() {
        return count;
    }
}
