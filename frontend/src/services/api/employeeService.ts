import { apiClient } from "@/src/services/api/ApiClient";
import type {
    EmployeeDetailDto,
    EmployeeListParamsDto,
    EmployeeListResponseDto,
    RegisterEmployeeDto,
    RegisterEmployeeResponseDto,
} from "@/src/dtos/employer/employee.dtos";

const BASE_PATH = "/api/v1/employers";

export async function registerEmployee(
    employerId: string,
    data: RegisterEmployeeDto
): Promise<RegisterEmployeeResponseDto> {
    return apiClient.request<RegisterEmployeeResponseDto>({
        method: "POST",
        endpoint: `${BASE_PATH}/${employerId}/employees`,
        body: data,
    });
}

export async function listEmployees(
    employerId: string,
    params?: EmployeeListParamsDto
): Promise<EmployeeListResponseDto> {
    const query = new URLSearchParams();

    if (params?.page !== undefined)
        query.append("page", String(params.page));
    if (params?.size !== undefined)
        query.append("size", String(params.size));
    if (params?.status)
        query.append("status", params.status);

    const queryString = query.toString();
    const endpoint = `${BASE_PATH}/${employerId}/employees${queryString ? `?${queryString}` : ""
        }`;

    return apiClient.request<EmployeeListResponseDto>({
        method: "GET",
        endpoint,
    });
}

export async function getEmployeeDetail(
    employerId: string,
    contractId: string
): Promise<EmployeeDetailDto> {
    return apiClient.request<EmployeeDetailDto>({
        method: "GET",
        endpoint: `${BASE_PATH}/${employerId}/employee-detail/${contractId}`,
    });
}