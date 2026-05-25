import { httpClient } from "@/src/config/http";
import type {
    ChangeSalaryPositionDto,
    ChangeSalaryPositionResponseDto,
    EmployeeDetailDto,
    EmployeeListParamsDto,
    EmployeeListResponseDto,
    RegisterEmployeeDto,
    RegisterEmployeeResponseDto,
    UpdateEmployeeDto,
    UpdateEmployeeResponseDto,
} from "@/src/dtos/employer/employee.dtos";
import { apiClient } from "@/src/services/api/ApiClient";

const BASE_PATH = "/api/v1/employers";

export async function registerEmployee(
    employerId: string,
    data: RegisterEmployeeDto
): Promise<RegisterEmployeeResponseDto> {
    const response = await httpClient.post<RegisterEmployeeResponseDto>(
        `${BASE_PATH}/${employerId}/new-employee`,
        data
    );
    return response.data;
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
    const endpoint = `${BASE_PATH}/${employerId}/list-employees${queryString ? `?${queryString}` : ""}`;

    const response = await httpClient.get<EmployeeListResponseDto>(endpoint);
    return response.data;
}

export async function getEmployeeDetail(
    employerId: string,
    contractId: string
): Promise<EmployeeDetailDto> {
    const response = await httpClient.get<EmployeeDetailDto>(
        `${BASE_PATH}/${employerId}/employee-detail/${contractId}`
    );
    return response.data;
}

export async function updateEmployee(
    employerId: string,
    contractId: string,
    data: UpdateEmployeeDto
): Promise<UpdateEmployeeResponseDto> {
    const response = await httpClient.put<UpdateEmployeeResponseDto>(
        `${BASE_PATH}/${employerId}/update-employee/${contractId}`,
        data
    );
    return response.data;
}

export async function changeSalaryPosition(
    employerId: string,
    contractId: string,
    data: ChangeSalaryPositionDto
): Promise<ChangeSalaryPositionResponseDto> {
    const response = await httpClient.patch<ChangeSalaryPositionResponseDto>(
        `${BASE_PATH}/${employerId}/change-salary-position/${contractId}`,
        data
    );
    return response.data;
}