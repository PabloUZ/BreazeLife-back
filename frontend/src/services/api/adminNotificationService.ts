import { httpClient } from "@/src/config/http";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import type {
  AdminApiResponseDto,
  AdminNotificationDto,
  AdminNotificationListParamsDto,
  AdminPaginationDto,
} from "@/src/dtos/admin/admin.dtos";

const BASE_PATH = "/api/v1/admin/notifications";

type HttpErrorShape = {
  response?: {
    data?: ApiErrorResponseDto;
  };
};

export type AdminNotificationsListResult = {
  message: string;
  notifications: AdminNotificationDto[];
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

export async function getAdminNotifications(
  params?: AdminNotificationListParamsDto
): Promise<AdminNotificationsListResult> {
  try {
    const query = new URLSearchParams();

    if (params?.page !== undefined) {
      query.append("page", String(params.page));
    }
    if (params?.limit !== undefined) {
      query.append("limit", String(params.limit));
    }
    if (params?.read !== undefined) {
      query.append("read", String(params.read));
    }

    const endpoint = `${BASE_PATH}${query.toString() ? `?${query.toString()}` : ""}`;
    const response = await httpClient.get<
      AdminApiResponseDto<AdminNotificationDto[]>
    >(endpoint);

    return {
      message: response.data.message,
      notifications: response.data.data ?? [],
      pagination: response.data.pagination ?? null,
    };
  } catch (error) {
    throw extractApiError(error);
  }
}

export async function markAdminNotificationAsRead(
  notificationId: string
): Promise<AdminNotificationDto> {
  try {
    const response = await httpClient.patch<
      AdminApiResponseDto<AdminNotificationDto>
    >(`${BASE_PATH}/${notificationId}/read`);

    return response.data.data;
  } catch (error) {
    throw extractApiError(error);
  }
}
