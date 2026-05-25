export interface AccountProfitDetailDto {
  account_id: string;
  account_type: "CONSERVATIVE" | "MODERATE" | "RISKY";
  monthly_rate: number;
  previous_balance: number;
  profit: number;
  new_balance: number;
}

export interface ApplyProfitabilityResponseDto {
  applied_at: string;
  accounts_processed: number;
  total_profit_added: number;
  details: AccountProfitDetailDto[];
}

export interface ProfitabilityHistoryPeriodDto {
  period: string;
  applied_at: string;
  accounts_processed: number;
  total_profit: number;
}

