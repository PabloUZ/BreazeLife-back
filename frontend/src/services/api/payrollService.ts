import { httpClient } from "@/src/config/http";
import type {
  PayrollExecuteResponseDto,
  PayrollPeriodRequestDto,
  PayrollPreviewResponseDto,
  PayrollHistoryResponseDto,
  PayrollDetailResponseDto,
} from "@/src/dtos/employer/employer.dtos";

const BASE_PATH = "/api/v1/payroll";

export async function previewPayroll(
  data: PayrollPeriodRequestDto
): Promise<PayrollPreviewResponseDto> {
  const response = await httpClient.post<PayrollPreviewResponseDto>(
    `${BASE_PATH}/preview`,
    data
  );
  return response.data;
}

export async function executePayroll(
  data: PayrollPeriodRequestDto
): Promise<PayrollExecuteResponseDto> {
  const response = await httpClient.post<PayrollExecuteResponseDto>(
    `${BASE_PATH}/execute`,
    data
  );
  return response.data;
}

export async function getPayrollHistory(params?: {
  page?: number;
  limit?: number;
  period?: string;
  status?: string;
}): Promise<PayrollHistoryResponseDto> {
  const response = await httpClient.get<PayrollHistoryResponseDto>(BASE_PATH, {
    params,
  });
  return response.data;
}

export async function getPayrollDetail(
  payrollId: string
): Promise<PayrollDetailResponseDto> {
  const response = await httpClient.get<PayrollDetailResponseDto>(
    `${BASE_PATH}/${payrollId}`
  );
  return response.data;
}
