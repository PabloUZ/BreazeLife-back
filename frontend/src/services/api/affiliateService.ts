// src/services/api/affiliateService.ts

import { httpClient } from "@/src/config/http";
import type { ApiResponseDto, ProgressResponseDto } from "@/src/dtos/affiliate/affiliate.dtos";

const BASE_PATH = "/api/v1/affiliates";

export async function getAffiliateProgress(
  affiliateId: string
): Promise<ProgressResponseDto> {
  // Tu backend devuelve la data envuelta en un objeto ApiResponse
  const response = await httpClient.get<ApiResponseDto<ProgressResponseDto>>(
    `${BASE_PATH}/${affiliateId}/progress`
  );
  
  // Retornamos directamente el objeto 'data' interno
  return response.data.data;
}