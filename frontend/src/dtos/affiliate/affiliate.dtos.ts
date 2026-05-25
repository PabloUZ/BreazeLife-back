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


// Interfaz genérica para envolver las respuestas del back
export interface ApiResponseDto<T> {
  message: string;
  status_code: number;
  status: string;
  data: T;
}


export interface PayslipDto {
  affiliateDocument: string;
  affiliateName: string;
  employerContrib: number;
  grossSalary: number;
  netSalaryReceived: number;
  pensionDeduction: number;
  period: string;
  status: string;
  totalContrib: number;
}

// Interfaz para la paginación de Spring Boot
export interface PaginatedResponseDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}