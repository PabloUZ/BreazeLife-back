import { httpClient } from "@/src/config/http";
import type {
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
    const response = await httpClient.get<EmployeeListResponseDto>(
        `${BASE_PATH}/${employerId}/list-employees`,
        { params }
    );
    return response.data;
}
