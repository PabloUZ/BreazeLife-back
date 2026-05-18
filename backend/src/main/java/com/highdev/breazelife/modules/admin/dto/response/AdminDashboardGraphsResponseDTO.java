package com.highdev.breazelife.modules.admin.dto.response;

import java.util.List;

public class AdminDashboardGraphsResponseDTO {
    private final List<QuoteStatusGraphDTO> quotesByStatus;
    private final List<MonthlyContributionGraphDTO> monthlyContributions;
    private final List<AffiliateFundTypeGraphDTO> affiliatesByFundType;
    private final List<FundDistributionGraphDTO> fundDistribution;

    public AdminDashboardGraphsResponseDTO(
            List<QuoteStatusGraphDTO> quotesByStatus,
            List<MonthlyContributionGraphDTO> monthlyContributions,
            List<AffiliateFundTypeGraphDTO> affiliatesByFundType,
            List<FundDistributionGraphDTO> fundDistribution
    ) {
        this.quotesByStatus = quotesByStatus;
        this.monthlyContributions = monthlyContributions;
        this.affiliatesByFundType = affiliatesByFundType;
        this.fundDistribution = fundDistribution;
    }

    public List<QuoteStatusGraphDTO> getQuotesByStatus() {
        return quotesByStatus;
    }

    public List<MonthlyContributionGraphDTO> getMonthlyContributions() {
        return monthlyContributions;
    }

    public List<AffiliateFundTypeGraphDTO> getAffiliatesByFundType() {
        return affiliatesByFundType;
    }

    public List<FundDistributionGraphDTO> getFundDistribution() {
        return fundDistribution;
    }
}
