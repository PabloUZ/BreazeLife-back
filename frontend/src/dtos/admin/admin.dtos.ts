export interface AdminDashboardSummaryDto {
  activeAffiliates: number;
  activeEmployers: number;
  pendingContributions: number;
  managedBalance: number;
  monthlyContributions: number;
}

export type QuoteStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type AffiliateFundType = "CONSERVATIVE" | "MODERATE" | "RISKY";

export type DistributionFundType = "PAYROLL" | "PENSION";

export interface QuoteStatusGraphItemDto {
  status: QuoteStatus;
  count: number;
}

export interface MonthlyContributionGraphItemDto {
  month: string;
  totalContribution: number;
}

export interface AffiliateFundTypeGraphItemDto {
  fundType: AffiliateFundType;
  count: number;
}

export interface FundDistributionGraphItemDto {
  fundType: DistributionFundType;
  totalBalance: number;
}

export interface AdminDashboardGraphsDto {
  quotesByStatus: QuoteStatusGraphItemDto[];
  monthlyContributions: MonthlyContributionGraphItemDto[];
  affiliatesByFundType: AffiliateFundTypeGraphItemDto[];
  fundDistribution: FundDistributionGraphItemDto[];
}

export type AdminDashboardDto = AdminDashboardSummaryDto;

export type AdminAffiliateDto = Record<string, never>;

export type AdminEmployerDto = Record<string, never>;

export type AdminQuoteDto = Record<string, never>;

export type AdminReportDto = Record<string, never>;

export type AdminSettingsDto = Record<string, never>;

export type AdminNotificationDto = Record<string, never>;
