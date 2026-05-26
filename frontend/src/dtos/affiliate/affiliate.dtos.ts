export interface AffiliateDashboardDto {
  accountId: string;
  accountType: string;
  balance: number;
  quotedWeeks: number;
  weeksRemaining: number;
  progressPercentage: number;
  monthlyProfitability: {
    profit: number;
    date: string;
  } | null;
  lastContribution: {
    quoteId: string;
    employerContrib: number;
    affiliateContrib: number;
    totalContribution: number;
    daysContributed: number;
    contribDate: string;
    status: string;
  } | null;
}

export interface AffiliateProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verified: boolean;
  document: string;
  birthDate: string;
  affiliationDate: string;
  phone: string;
  status: string;
  account: {
    accountId: string;
    accountType: string;
    balance: number;
    quotedDays: number;
  } | null;
}

export interface UpdateAffiliateProfileDto {
  email?: string;
  phone?: string;
  current_password?: string;
  new_password?: string;
  account_type?: string;
}

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

export interface AffiliatePaymentItemDto {
  payment_id: string;
  period: string;
  company_name: string;
  position: string;
  base_salary: number;
  net_salary: number;
  total_pension_contrib: number;
  status: string;
  paid_at: string;
}

export interface AffiliatePaymentHistoryResponseDto {
  items: AffiliatePaymentItemDto[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface PaymentDetailResponseDto {
  payment_id: string;
  period: string;
  company_name: string;
  affiliate_name: string;
  document: string;
  position: string;
  base_salary: number;
  employee_pension_deduction: number;
  net_salary: number;
  employer_pension_contrib: number;
  total_pension_contrib: number;
  days_contributed: number;
  quote_id: string | null;
  quote_status: string | null;
  status: string;
  paid_at: string;
}