export type FundType = "PAYROLL" | "PENSION";

export interface FundDto {
  employerId: string;
  type: FundType;
  balance: number;
  updatedAt: string | null;
}

export interface FundListResponseDto {
  message: string;
  status_code: number;
  status: string;
  data: FundDto[];
}

export interface FundResponseDto {
  message: string;
  status_code: number;
  status: string;
  data: FundDto;
}

export interface RechargeFundDto {
  amount: number;
}

export interface MovementDto {
  movementId: string;
  employerId: string;
  fundType: FundType;
  type: "INCOME" | "OUTCOME";
  amount: number;
  date: string;
}

export interface MovementPageDto {
  employerId: string;
  fundType: FundType;
  totalRecords: number;
  page: number;
  limit: number;
  movements: MovementDto[];
}

export interface MovementPageResponseDto {
  message: string;
  status_code: number;
  status: string;
  data: MovementPageDto;
}

export interface MovementListParamsDto {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}