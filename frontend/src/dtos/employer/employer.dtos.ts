export type EmployerDashboardDto = Record<string, never>;

export type EmployerEmployeeDto = Record<string, never>;

// ─── Payroll ──────────────────────────────────────────────────────────────────

export type PayrollPeriodRequestDto = {
  period: string;
};

export type PayrollPreviewEmployeeDto = {
  contract_id: string;
  affiliate_name: string;
  document: string;
  position: string;
  base_salary: number;
  employee_pension_deduction: number;
  net_salary: number;
  employer_pension_contrib: number;
  total_pension_contrib: number;
  payroll_fund_debit: number;
  pension_fund_debit: number;
};

export type PayrollPreviewTotalsDto = {
  total_employees: number;
  total_gross_salary: number;
  total_net_salary: number;
  total_employer_pension_contrib: number;
  total_employee_pension_deduction: number;
  total_pension_contrib: number;
  total_payroll_fund_debit: number;
  total_pension_fund_debit: number;
  total_debit: number;
};

export type PayrollFundStatusDto = {
  payroll_fund_sufficient: boolean;
  pension_fund_sufficient: boolean;
  can_execute: boolean;
};

export type PayrollPreviewDataDto = {
  period: string;
  employer_id: string;
  company_name: string;
  payroll_fund_balance: number;
  pension_fund_balance: number;
  employees: PayrollPreviewEmployeeDto[];
  totals: PayrollPreviewTotalsDto;
  fund_status: PayrollFundStatusDto;
};

export type PayrollPreviewResponseDto = {
  message: string;
  status_code: number;
  status: string;
  data: PayrollPreviewDataDto;
};

// ─── Payroll Execute ──────────────────────────────────────────────────────────

export type PayrollPaymentResultDto = {
  payment_id: string;
  contract_id: string;
  affiliate_name: string;
  document: string;
  net_salary: number;
  quote_id: string;
  status: string;
};

export type PayrollExecuteTotalsDto = {
  total_employees: number;
  total_net_salary_paid: number;
  total_pension_contrib: number;
  total_debit: number;
};

export type PayrollExecuteDataDto = {
  period: string;
  employer_id: string;
  company_name: string;
  status: string;
  payments: PayrollPaymentResultDto[];
  totals: PayrollExecuteTotalsDto;
  payroll_fund_remaining: number;
  pension_fund_remaining: number;
};

export type PayrollExecuteResponseDto = {
  message: string;
  status_code: number;
  status: string;
  data: PayrollExecuteDataDto;
};

export type EmployerFundDto = Record<string, never>;

export type EmployerReportDto = Record<string, never>;

export type EmployerNotificationDto = Record<string, never>;

// ─── Payroll History ──────────────────────────────────────────────────────────

export type PayrollHistoryItemDto = {
  payroll_id: string;
  period: string;
  total_employees: number;
  total_net_salary: number;
  total_pension_contrib: number;
  total_debit: number;
  status: string;
  executed_at: string;
};

export type PayrollHistoryPaginationDto = {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
};

export type PayrollHistoryDataDto = {
  items: PayrollHistoryItemDto[];
  pagination: PayrollHistoryPaginationDto;
};

export type PayrollHistoryResponseDto = {
  message: string;
  status_code: number;
  status: string;
  data: PayrollHistoryDataDto;
};

// ─── Payroll Detail ───────────────────────────────────────────────────────────

export type PayrollDetailPaymentDto = {
  payment_id: string;
  contract_id: string;
  affiliate_name: string;
  document: string;
  position: string;
  base_salary: number;
  employee_pension_deduction: number;
  net_salary: number;
  employer_pension_contrib: number;
  total_pension_contrib: number;
  days_contributed: number;
  quote_id: string;
  quote_status: string;
  status: string;
};

export type PayrollDetailTotalsDto = {
  total_employees: number;
  total_gross_salary: number;
  total_net_salary: number;
  total_employer_pension_contrib: number;
  total_employee_pension_deduction: number;
  total_pension_contrib: number;
  total_debit: number;
};

export type PayrollDetailDataDto = {
  payroll_id: string;
  period: string;
  employer_id: string;
  company_name: string;
  status: string;
  executed_at: string;
  payments: PayrollDetailPaymentDto[];
  totals: PayrollDetailTotalsDto;
};

export type PayrollDetailResponseDto = {
  message: string;
  status_code: number;
  status: string;
  data: PayrollDetailDataDto;
};
