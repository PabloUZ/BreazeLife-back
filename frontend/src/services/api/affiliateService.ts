// src/services/api/affiliateService.ts

import { httpClient } from "@/src/config/http";
import type {
  ApiResponseDto,
  AffiliateDashboardDto,
  AffiliateProfileDto,
  UpdateAffiliateProfileDto,
  ProgressResponseDto,
  PaginatedResponseDto,
  PayslipDto,
  AffiliatePaymentHistoryResponseDto,
  PaymentDetailResponseDto,
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

function getFirstDefined<T>(...values: Array<T | null | undefined>): T | undefined {
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
    account_id: getFirstDefined(raw.account_id, raw.accountId) ?? "",
    account_type: getFirstDefined(raw.account_type, raw.accountType) ?? "",
    balance: toSafeNumber(raw.balance),
    quoted_weeks: quotedWeeks,
    weeks_remaining: weeksRemaining,
    progress_percentage: progressPercentage,
    monthly_profitability: monthlyProfitability
      ? {
          profit: toSafeNumber(monthlyProfitability.profit),
          date: monthlyProfitability.date ?? "",
        }
      : null,
    last_contribution: lastContribution
      ? {
          quote_id:
            getFirstDefined(lastContribution.quote_id, lastContribution.quoteId) ?? "",
          employer_contrib: toSafeNumber(
            getFirstDefined(
              lastContribution.employer_contrib,
              lastContribution.employerContrib
            )
          ),
          affiliate_contrib: toSafeNumber(
            getFirstDefined(
              lastContribution.affiliate_contrib,
              lastContribution.affiliateContrib
            )
          ),
          total_contribution: toSafeNumber(
            getFirstDefined(
              lastContribution.total_contribution,
              lastContribution.totalContribution
            )
          ),
          days_contributed: toSafeNumber(
            getFirstDefined(
              lastContribution.days_contributed,
              lastContribution.daysContributed
            )
          ),
          contrib_date:
            getFirstDefined(lastContribution.contrib_date, lastContribution.contribDate) ?? "",
          status: lastContribution.status ?? "UNKNOWN",
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
  const response = await httpClient.get<ApiResponseDto<AffiliateProfileDto>>(
    "/api/v1/affiliate/profile"
  );
  return response.data.data;
}

export async function updateAffiliateProfile(
  body: UpdateAffiliateProfileDto
): Promise<void> {
  await httpClient.patch("/api/v1/affiliate/profile", body);
}

export async function getAffiliateProgress(
  affiliateId: string
): Promise<ProgressResponseDto> {
  // Tu backend devuelve la data envuelta en un objeto ApiResponse
  const response = await httpClient.get<ApiResponseDto<ProgressResponseDto>>(
    `${BASE_PATH}/${affiliateId}/progress`
  );
  
  // Retornamos directamente el objeto 'data' interno
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

  // Ajusta la ruta según cómo tengas configurado tu axios
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
  
  return response.data.data; // Devuelve el PagedResponseDTO
}

export async function getRentabilities(affiliateId: string, page: number = 0, size: number = 5) {
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
