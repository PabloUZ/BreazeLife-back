export interface AdminDashboardSummaryDto {
  activeAffiliates: number;
  activeEmployers: number;
  pendingContributions: number;
  managedBalance: number;
  monthlyContributions: number;
}

export type AdminDashboardDto = AdminDashboardSummaryDto;

export type AdminAffiliateDto = Record<string, never>;

export type AdminEmployerDto = Record<string, never>;

export type AdminQuoteDto = Record<string, never>;

export type AdminReportDto = Record<string, never>;

export type AdminSettingsDto = Record<string, never>;

export type AdminNotificationDto = Record<string, never>;
