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


export interface QuoteResponseDto {
  quoteId: string;
  employerContrib: number;
  affiliateContrib: number;
  totalContrib: number;
  daysContributed: number;
  contribDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  comment?: string;
  payment?: {
    paymentId: string;
    netSalary: number;
    grossSalary: number;
    date: string;
  };
}

export interface ProfitabilityResponseDto {
  id: string;
  profit: number;
  date: string;
  accountType: string;
}