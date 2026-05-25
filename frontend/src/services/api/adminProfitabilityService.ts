import { httpClient } from "@/src/config/http";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import type {
  ApplyProfitabilityResponseDto,
  ProfitabilityHistoryPeriodDto,
} from "@/src/dtos/admin/profitability.dtos";
import type { AdminApiResponseDto } from "@/src/dtos/admin/admin.dtos";

const BASE_PATH = "/api/v1/admin/profitability";

type HttpErrorShape = {
  response?: { data?: ApiErrorResponseDto };
};

function hasApiErrorResponse(error: unknown): error is HttpErrorShape {
  return typeof error === "object" && error !== null && "response" in error;
}

function extractApiError(error: unknown): ApiErrorResponseDto {
  if (hasApiErrorResponse(error) && error.response?.data) {
    return error.response.data as ApiErrorResponseDto;
  }
  return {
    message: "Error de conexión. Revisa tu red e intenta de nuevo.",
    message_code: "NETWORK_ERROR",
    status_code: 0,
    status: "NETWORK_ERROR",
  };
}

export async function applyMonthlyProfitability(): Promise<ApplyProfitabilityResponseDto> {
  try {
    const response = await httpClient.post<
      AdminApiResponseDto<ApplyProfitabilityResponseDto>
    >(`${BASE_PATH}/apply`);
    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

export async function getProfitabilityHistory(): Promise<ProfitabilityHistoryPeriodDto[]> {
  try {
    const response = await httpClient.get<
      AdminApiResponseDto<ProfitabilityHistoryPeriodDto[]>
    >(`${BASE_PATH}/history`);
    return response.data.data ?? [];
  } catch (error) {
    throw extractApiError(error);
  }
}

