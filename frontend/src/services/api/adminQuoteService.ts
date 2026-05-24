import { httpClient } from "@/src/config/http";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import type {
  AdminApiResponseDto,
  AdminPaginationDto,
  AdminQuoteDto,
  AdminQuoteListParamsDto,
  ReviewQuoteRequestDto,
} from "@/src/dtos/admin/admin.dtos";

const BASE_PATH = "/api/v1/admin/quotes";

type HttpErrorShape = {
  response?: {
    data?: ApiErrorResponseDto;
  };
};

export type AdminQuotesListResult = {
  message: string;
  pagination: AdminPaginationDto | null;
  quotes: AdminQuoteDto[];
};

function hasApiErrorResponse(error: unknown): error is HttpErrorShape {
  return typeof error === "object" && error !== null && "response" in error;
}

function extractApiError(error: unknown): ApiErrorResponseDto {
  if (hasApiErrorResponse(error) && error.response?.data) {
    return error.response.data as ApiErrorResponseDto;
  }

  return {
    message: "Error de conexion. Revisa tu red e intenta de nuevo.",
    message_code: "NETWORK_ERROR",
    status_code: 0,
    status: "NETWORK_ERROR",
  };
}

export async function getAdminQuotes(
  params?: AdminQuoteListParamsDto
): Promise<AdminQuotesListResult> {
  try {
    const query = new URLSearchParams();

    if (params?.page !== undefined) {
      query.append("page", String(params.page));
    }
    if (params?.limit !== undefined) {
      query.append("limit", String(params.limit));
    }
    if (params?.status) {
      query.append("status", params.status);
    }

    const endpoint = `${BASE_PATH}${query.toString() ? `?${query.toString()}` : ""}`;
    const response = await httpClient.get<AdminApiResponseDto<AdminQuoteDto[]>>(
      endpoint
    );

    return {
      message: response.data.message,
      pagination: response.data.pagination ?? null,
      quotes: response.data.data ?? [],
    };
  } catch (error) {
    throw extractApiError(error);
  }
}

export async function getAdminQuoteById(quoteId: string): Promise<AdminQuoteDto> {
  try {
    const response = await httpClient.get<AdminApiResponseDto<AdminQuoteDto>>(
      `${BASE_PATH}/${quoteId}`
    );

    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

export async function approveAdminQuote(
  quoteId: string,
  payload?: ReviewQuoteRequestDto
): Promise<AdminQuoteDto> {
  try {
    const response = await httpClient.patch<AdminApiResponseDto<AdminQuoteDto>>(
      `${BASE_PATH}/${quoteId}/approve`,
      payload
    );

    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

export async function rejectAdminQuote(
  quoteId: string,
  payload?: ReviewQuoteRequestDto
): Promise<AdminQuoteDto> {
  try {
    const response = await httpClient.patch<AdminApiResponseDto<AdminQuoteDto>>(
      `${BASE_PATH}/${quoteId}/reject`,
      payload
    );

    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}
