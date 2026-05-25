export interface SystemConfigDto {
  rate_conservative: number;
  rate_moderate: number;
  rate_risky: number;
  life_expectancy: number;
  contribution_rate: number;
}

export interface UpdateSystemConfigDto {
  rate_conservative: number;
  rate_moderate: number;
  rate_risky: number;
  life_expectancy: number;
  contribution_rate: number;
}

