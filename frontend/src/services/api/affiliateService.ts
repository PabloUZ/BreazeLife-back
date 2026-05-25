import { httpClient } from "@/src/config/http";
import type {
  AffiliateDashboardDto,
  AffiliatePaymentHistoryResponseDto,
  AffiliateProfileDto,
  ApiResponseDto,
  PaginatedResponseDto,
  PaymentDetailResponseDto,
  PayslipDto,
  ProgressResponseDto,
  UpdateAffiliateProfileDto,
} from "@/src/dtos/affiliate/affiliate.dtos";

const BASE_PATH = "/api/v1/affiliates";
const REQUIRED_WEEKS = 1300;

type NumericValue = number | string | null | undefined;

type RawAffiliateDashboardDto = {
  accountId?: string | null;
  account_id?: string | null;
  accountType?: string | null;
  account_type?: string | null;
  balance?: NumericValue;
  quotedWeeks?: NumericValue;
  quoted_weeks?: NumericValue;
  quotedDays?: NumericValue;
  quoted_days?: NumericValue;
  weeksRemaining?: NumericValue;
  weeks_remaining?: NumericValue;
  progressPercentage?: NumericValue;
  progress_percentage?: NumericValue;
  monthlyProfitability?: {
    profit?: NumericValue;
    date?: string | null;
  } | null;
  monthly_profitability?: {
    profit?: NumericValue;
    date?: string | null;
  } | null;
  lastContribution?: {
    quoteId?: string | null;
    quote_id?: string | null;
    employerContrib?: NumericValue;
    employer_contrib?: NumericValue;
    affiliateContrib?: NumericValue;
    affiliate_contrib?: NumericValue;
    totalContribution?: NumericValue;
    total_contribution?: NumericValue;
    daysContributed?: NumericValue;
    days_contributed?: NumericValue;
    contribDate?: string | null;
    contrib_date?: string | null;
    status?: string | null;
  } | null;
  last_contribution?: {
    quoteId?: string | null;
    quote_id?: string | null;
    employerContrib?: NumericValue;
    employer_contrib?: NumericValue;
    affiliateContrib?: NumericValue;
    affiliate_contrib?: NumericValue;
    totalContribution?: NumericValue;
    total_contribution?: NumericValue;
    daysContributed?: NumericValue;
    days_contributed?: NumericValue;
    contribDate?: string | null;
    contrib_date?: string | null;
    status?: string | null;
  } | null;
};

type RawAffiliateProfileDto = {
  userId?: string | null;
  user_id?: string | null;
  firstName?: string | null;
  first_name?: string | null;
  lastName?: string | null;
  last_name?: string | null;
  email?: string | null;
  role?: string | null;
  verified?: boolean | null;
  document?: string | null;
  birthDate?: string | null;
  birth_date?: string | null;
  affiliationDate?: string | null;
  affiliation_date?: string | null;
  phone?: string | null;
  status?: string | null;
  account?: {
    accountId?: string | null;
    account_id?: string | null;
    accountType?: string | null;
    account_type?: string | null;
    balance?: NumericValue;
    quotedDays?: NumericValue;
    quoted_days?: NumericValue;
  } | null;
};

function getFirstDefined<T>(...values: (T | null | undefined)[]): T | undefined {
  return values.find((value) => value !== undefined && value !== null);
}

function toSafeNumber(value: NumericValue, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeAffiliateDashboard(raw: RawAffiliateDashboardDto): AffiliateDashboardDto {
  const quotedDays = getFirstDefined(raw.quotedDays, raw.quoted_days);
  const rawQuotedWeeks = getFirstDefined(raw.quotedWeeks, raw.quoted_weeks);
  const computedQuotedWeeks =
    rawQuotedWeeks !== undefined
      ? toSafeNumber(rawQuotedWeeks)
      : toSafeNumber(quotedDays) / 7;
  const quotedWeeks = roundToTwo(Math.max(computedQuotedWeeks, 0));

  const rawWeeksRemaining = getFirstDefined(raw.weeksRemaining, raw.weeks_remaining);
  const computedWeeksRemaining =
    rawWeeksRemaining !== undefined
      ? toSafeNumber(rawWeeksRemaining)
      : REQUIRED_WEEKS - quotedWeeks;
  const weeksRemaining = roundToTwo(Math.max(computedWeeksRemaining, 0));

  const rawProgressPercentage = getFirstDefined(
    raw.progressPercentage,
    raw.progress_percentage
  );
  const computedProgressPercentage =
    rawProgressPercentage !== undefined
      ? toSafeNumber(rawProgressPercentage)
      : (quotedWeeks / REQUIRED_WEEKS) * 100;
  const progressPercentage = roundToTwo(
    Math.min(Math.max(computedProgressPercentage, 0), 100)
  );

  const monthlyProfitability =
    getFirstDefined(raw.monthlyProfitability, raw.monthly_profitability) ?? null;
  const lastContribution =
    getFirstDefined(raw.lastContribution, raw.last_contribution) ?? null;

  return {
    accountId: getFirstDefined(raw.accountId, raw.account_id) ?? "",
    accountType: getFirstDefined(raw.accountType, raw.account_type) ?? "",
    balance: toSafeNumber(raw.balance),
    quotedWeeks,
    weeksRemaining,
    progressPercentage,
    monthlyProfitability: monthlyProfitability
      ? {
          profit: toSafeNumber(monthlyProfitability.profit),
          date: monthlyProfitability.date ?? "",
        }
      : null,
    lastContribution: lastContribution
      ? {
          quoteId: getFirstDefined(lastContribution.quoteId, lastContribution.quote_id) ?? "",
          employerContrib: toSafeNumber(
            getFirstDefined(
              lastContribution.employerContrib,
              lastContribution.employer_contrib
            )
          ),
          affiliateContrib: toSafeNumber(
            getFirstDefined(
              lastContribution.affiliateContrib,
              lastContribution.affiliate_contrib
            )
          ),
          totalContribution: toSafeNumber(
            getFirstDefined(
              lastContribution.totalContribution,
              lastContribution.total_contribution
            )
          ),
          daysContributed: toSafeNumber(
            getFirstDefined(lastContribution.daysContributed, lastContribution.days_contributed)
          ),
          contribDate:
            getFirstDefined(lastContribution.contribDate, lastContribution.contrib_date) ?? "",
          status: lastContribution.status ?? "UNKNOWN",
        }
      : null,
  };
}

function normalizeAffiliateProfile(raw: RawAffiliateProfileDto): AffiliateProfileDto {
  return {
    userId: getFirstDefined(raw.userId, raw.user_id) ?? "",
    firstName: getFirstDefined(raw.firstName, raw.first_name) ?? "",
    lastName: getFirstDefined(raw.lastName, raw.last_name) ?? "",
    email: raw.email ?? "",
    role: raw.role ?? "",
    verified: raw.verified ?? false,
    document: raw.document ?? "",
    birthDate: getFirstDefined(raw.birthDate, raw.birth_date) ?? "",
    affiliationDate: getFirstDefined(raw.affiliationDate, raw.affiliation_date) ?? "",
    phone: raw.phone ?? "",
    status: raw.status ?? "",
    account: raw.account
      ? {
          accountId: getFirstDefined(raw.account.accountId, raw.account.account_id) ?? "",
          accountType: getFirstDefined(raw.account.accountType, raw.account.account_type) ?? "",
          balance: toSafeNumber(raw.account.balance),
          quotedDays: toSafeNumber(
            getFirstDefined(raw.account.quotedDays, raw.account.quoted_days)
          ),
        }
      : null,
  };
}

export async function getAffiliateDashboard(): Promise<AffiliateDashboardDto> {
  const response = await httpClient.get<ApiResponseDto<RawAffiliateDashboardDto>>(
    "/api/v1/affiliate/dashboard"
  );
  return normalizeAffiliateDashboard(response.data.data);
}

export async function getAffiliateProfile(): Promise<AffiliateProfileDto> {
  const response = await httpClient.get<ApiResponseDto<RawAffiliateProfileDto>>(
    "/api/v1/affiliate/profile"
  );
  return normalizeAffiliateProfile(response.data.data);
}

export async function updateAffiliateProfile(
  body: UpdateAffiliateProfileDto
): Promise<void> {
  await httpClient.patch("/api/v1/affiliate/profile", body);
}

export async function getAffiliateProgress(
  affiliateId: string
): Promise<ProgressResponseDto> {
  const response = await httpClient.get<ApiResponseDto<ProgressResponseDto>>(
    `${BASE_PATH}/${affiliateId}/progress`
  );
  return response.data.data;
}

export async function getPayslips(
  affiliateId: string,
  page: number = 0,
  size: number = 10,
  from?: string,
  to?: string
): Promise<PaginatedResponseDto<PayslipDto>> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (from && to) {
    query.append("from", from);
    query.append("to", to);
  }

  const response = await httpClient.get(
    `/api/v1/affiliates/${affiliateId}/payslips?${query.toString()}`
  );

  return response.data.data;
}

export async function getQuotes(
  affiliateId: string,
  page: number = 0,
  size: number = 10,
  from?: string,
  to?: string,
  status?: string
) {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (from && to) {
    query.append("from", from);
    query.append("to", to);
  }

  if (status) {
    query.append("status", status);
  }

  const response = await httpClient.get(
    `/api/v1/affiliates/${affiliateId}/quotes?${query.toString()}`
  );

  return response.data.data;
}

export async function getRentabilities(
  affiliateId: string,
  page: number = 0,
  size: number = 5
) {
  const response = await httpClient.get(
    `/api/v1/affiliates/${affiliateId}/rentabilities?page=${page}&size=${size}`
  );
  return response.data.data;
}

export async function getAffiliatePayments(params?: {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  status?: string;
}): Promise<ApiResponseDto<AffiliatePaymentHistoryResponseDto>> {
  const response = await httpClient.get<ApiResponseDto<AffiliatePaymentHistoryResponseDto>>(
    "/api/v1/payroll/payments",
    { params }
  );
  return response.data;
}

export async function getPaymentDetail(
  paymentId: string
): Promise<ApiResponseDto<PaymentDetailResponseDto>> {
  const response = await httpClient.get<ApiResponseDto<PaymentDetailResponseDto>>(
    `/api/v1/payroll/payments/${paymentId}`
  );
  return response.data;
}
