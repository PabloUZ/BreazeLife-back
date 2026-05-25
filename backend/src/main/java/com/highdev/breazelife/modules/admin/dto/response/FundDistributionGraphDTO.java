package com.highdev.breazelife.modules.admin.dto.response;

import java.math.BigDecimal;

public class FundDistributionGraphDTO {
    private final String fundType;
    private final BigDecimal totalBalance;

    public FundDistributionGraphDTO(String fundType, BigDecimal totalBalance) {
        this.fundType = fundType;
        this.totalBalance = totalBalance;
    }

    public String getFundType() {
        return fundType;
    }

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }
}
