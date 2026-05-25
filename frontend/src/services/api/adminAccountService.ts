import { httpClient } from "@/src/config/http";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import type {
  AdminAccountActionResponseDto,
  AdminAccountDetailDto,
  AdminAccountListItemDto,
  AdminAccountListParamsDto,
  AdminApiResponseDto,
  AdminPaginationDto,
  SuspendAccountRequestDto,
} from "@/src/dtos/admin/admin.dtos";

const BASE_PATH = "/api/v1/admin/accounts";

type HttpErrorShape = {
  response?: {
    data?: ApiErrorResponseDto;
  };
};

export type AdminAccountsListResult = {
  accounts: AdminAccountListItemDto[];
  message: string;
  pagination: AdminPaginationDto | null;
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

export async function listAdminAccounts(
  params?: AdminAccountListParamsDto
): Promise<AdminAccountsListResult> {
  try {
    const query = new URLSearchParams();

    if (params?.page !== undefined) {
      query.append("page", String(params.page));
    }
    if (params?.limit !== undefined) {
      query.append("limit", String(params.limit));
    }
    if (params?.role) {
      query.append("role", params.role);
    }
    if (params?.status) {
      query.append("status", params.status);
    }
    if (params?.verified !== undefined) {
      query.append("verified", String(params.verified));
    }
    if (params?.search?.trim()) {
      query.append("search", params.search.trim());
    }

    const endpoint = `${BASE_PATH}${query.toString() ? `?${query.toString()}` : ""}`;
    const response = await httpClient.get<
      AdminApiResponseDto<AdminAccountListItemDto[]>
    >(endpoint);

    return {
      accounts: response.data.data ?? [],
      message: response.data.message,
      pagination: response.data.pagination ?? null,
    };
  } catch (error) {
    throw extractApiError(error);
  }
}

export async function getAdminAccountById(
  userId: string
): Promise<AdminAccountDetailDto> {
  try {
    const response = await httpClient.get<
      AdminApiResponseDto<AdminAccountDetailDto>
    >(`${BASE_PATH}/${userId}`);

    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

export async function verifyAdminAccount(
  userId: string
): Promise<AdminAccountActionResponseDto> {
  try {
    const response = await httpClient.patch<
      AdminApiResponseDto<AdminAccountActionResponseDto>
    >(`${BASE_PATH}/${userId}/verify`);

    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

export async function suspendAdminAccount(
  userId: string,
  request?: SuspendAccountRequestDto
): Promise<AdminAccountActionResponseDto> {
  try {
    const response = await httpClient.patch<
      AdminApiResponseDto<AdminAccountActionResponseDto>
    >(`${BASE_PATH}/${userId}/suspend`, request);

    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

export async function activateAdminAccount(
  userId: string
): Promise<AdminAccountActionResponseDto> {
  try {
    const response = await httpClient.patch<
      AdminApiResponseDto<AdminAccountActionResponseDto>
    >(`${BASE_PATH}/${userId}/activate`);

    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}
