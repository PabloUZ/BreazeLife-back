import { httpClient } from "@/src/config/http";
import type { AdminApiResponseDto } from "@/src/dtos/admin/admin.dtos";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import type { SystemConfigDto, UpdateSystemConfigDto } from "@/src/dtos/admin/systemConfig.dtos";

const BASE_PATH = "/api/v1/admin/config";

type HttpErrorShape = { response?: { data?: ApiErrorResponseDto } };

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

export async function getSystemConfig(): Promise<SystemConfigDto> {
  try {
    const response = await httpClient.get<AdminApiResponseDto<SystemConfigDto>>(BASE_PATH);
    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

export async function updateSystemConfig(request: UpdateSystemConfigDto): Promise<SystemConfigDto> {
  try {
    const response = await httpClient.put<AdminApiResponseDto<SystemConfigDto>>(BASE_PATH, request);
    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

