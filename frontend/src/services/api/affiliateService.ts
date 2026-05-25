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

export async function getAffiliateDashboard(): Promise<AffiliateDashboardDto> {
  const response = await httpClient.get<ApiResponseDto<AffiliateDashboardDto>>(
    "/api/v1/affiliate/dashboard"
  );
  return response.data.data;
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