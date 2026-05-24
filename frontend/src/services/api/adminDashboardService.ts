import { httpClient } from "@/src/config/http";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import type { AdminDashboardSummaryDto } from "@/src/dtos/admin/admin.dtos";

const BASE_PATH = "/api/v1/admin/dashboard";

type HttpErrorShape = {
  response?: {
    data?: ApiErrorResponseDto;
  };
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

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummaryDto> {
  try {
    const response = await httpClient.get<AdminDashboardSummaryDto>(
      `${BASE_PATH}/summary`
    );
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}
