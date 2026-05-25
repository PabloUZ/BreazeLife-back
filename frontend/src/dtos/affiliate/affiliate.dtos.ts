export type AffiliateDashboardDto = Record<string, never>;

export type AffiliateProfileDto = Record<string, never>;

export type AffiliateContributionDto = Record<string, never>;

export interface ProgressResponseDto {
    accumulatedWeeks: number;
    missingWeeks: number;
    progressPercentage: number;
}
export type AffiliateNotificationDto = Record<string, never>;

export type AffiliateDocumentDto = Record<string, never>;


// Interfaz genérica para envolver las respuestas de tu backend
export interface ApiResponseDto<T> {
  message: string;
  status_code: number;
  status: string;
  data: T;
}