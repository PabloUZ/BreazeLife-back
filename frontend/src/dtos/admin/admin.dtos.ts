export interface AdminDashboardSummaryDto {
  activeAffiliates: number;
  activeEmployers: number;
  pendingContributions: number;
  managedBalance: number;
  monthlyContributions: number;
}

export type AdminAccountRole = "AFFILIATE" | "EMPLOYER";

export type AdminAccountStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";

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

export interface AdminAccountListItemDto {
  userId: string;
  role: AdminAccountRole;
  firstName: string;
  lastName: string;
  email: string;
  verified: boolean;
  status: AdminAccountStatus;
  document?: string | null;
  nit?: string | null;
  companyName?: string | null;
}

export interface AffiliateAccountDetailDto {
  document: string;
  birthDate?: string | null;
  phoneNumber?: string | null;
  affiliationDate?: string | null;
}

export interface EmployerAccountDetailDto {
  nit: string;
  companyName: string;
  sector?: string | null;
  nameLegalRep?: string | null;
  idLegalRep?: string | null;
}

export interface AdminAccountDetailDto {
  userId: string;
  role: AdminAccountRole;
  firstName: string;
  lastName: string;
  email: string;
  verified: boolean;
  status: AdminAccountStatus;
  suspendedReason?: string | null;
  affiliate?: AffiliateAccountDetailDto | null;
  employer?: EmployerAccountDetailDto | null;
}

export interface AdminAccountActionResponseDto {
  userId: string;
  role: AdminAccountRole;
  verified: boolean;
  status: AdminAccountStatus;
  suspendedReason?: string | null;
}

export interface SuspendAccountRequestDto {
  reason?: string;
}

export interface AdminPaginationDto {
  page: number;
  limit: number;
  total: number;
}

export interface AdminApiResponseDto<TData> {
  message: string;
  status_code: number;
  status: string;
  data: TData;
  pagination?: AdminPaginationDto;
}

export interface AdminAccountListParamsDto {
  page?: number;
  limit?: number;
  role?: AdminAccountRole;
  status?: AdminAccountStatus;
  verified?: boolean;
  search?: string;
}

export type AdminDashboardDto = AdminDashboardSummaryDto;

export type AdminAffiliateDto = Record<string, never>;

export type AdminEmployerDto = Record<string, never>;

export type AdminQuoteDto = Record<string, never>;

export type AdminReportDto = Record<string, never>;

export type AdminSettingsDto = Record<string, never>;

export type AdminNotificationDto = Record<string, never>;
