import { httpClient } from "@/src/config/http";
import type {
  PayrollPeriodRequestDto,
  PayrollPreviewResponseDto,
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
