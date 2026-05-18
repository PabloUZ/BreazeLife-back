package com.highdev.breazelife.modules.admin.dto.response;

import java.math.BigDecimal;

public class MonthlyContributionGraphDTO {
    private final String month;
    private final BigDecimal totalContribution;

    public MonthlyContributionGraphDTO(String month, BigDecimal totalContribution) {
        this.month = month;
        this.totalContribution = totalContribution;
    }

    public String getMonth() {
        return month;
    }

    public BigDecimal getTotalContribution() {
        return totalContribution;
    }
}
