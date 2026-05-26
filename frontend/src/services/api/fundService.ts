import { httpClient } from "@/src/config/http";
import type {
  FundDto,
  FundListResponseDto,
  FundResponseDto,
  FundType,
  MovementPageDto,
  MovementPageResponseDto,
  MovementListParamsDto,
  RechargeFundDto,
} from "@/src/dtos/fund/fund.dto";

const BASE_PATH = "/api/v1/employers";

export async function getFunds(employerId: string): Promise<FundDto[]> {
  const response = await httpClient.get<FundListResponseDto>(
    `${BASE_PATH}/${employerId}/funds`
  );
  return response.data.data;
}

export async function getFundByType(
  employerId: string,
  fundType: FundType
): Promise<FundDto> {
  const response = await httpClient.get<FundResponseDto>(
    `${BASE_PATH}/${employerId}/funds/${fundType}`
  );
  return response.data.data;
}

export async function rechargeFund(
  employerId: string,
  fundType: FundType,
  data: RechargeFundDto
): Promise<FundDto> {
  const response = await httpClient.post<FundResponseDto>(
    `${BASE_PATH}/${employerId}/funds/${fundType}/recharge`,
    data
  );
  return response.data.data;
}

export async function getFundMovements(
  employerId: string,
  fundType: FundType,
  params?: MovementListParamsDto
): Promise<MovementPageDto> {
  const query = new URLSearchParams();
  if (params?.from) query.append("from", params.from);
  if (params?.to) query.append("to", params.to);
  if (params?.page !== undefined) query.append("page", String(params.page));
  if (params?.limit !== undefined) query.append("limit", String(params.limit));

  const queryString = query.toString();
  const endpoint = `${BASE_PATH}/${employerId}/funds/${fundType}/movements${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await httpClient.get<MovementPageResponseDto>(endpoint);
  return response.data.data;
}