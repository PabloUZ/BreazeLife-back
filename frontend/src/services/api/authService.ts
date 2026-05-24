import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import { httpClient } from "@/src/config/http";
import type {
  ApiErrorResponseDto,
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  MeResponseDto,
  SignupRequestDto,
  SignupResponseDto,
} from "@/src/dtos/auth/auth.dtos";

const BASE_URL: string =
  Constants.expoConfig?.extra?.apiUrl ?? "http://10.0.2.2:8080";
const BASE_PATH = "/api/v1/auth";

const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractApiError(error: unknown): ApiErrorResponseDto {
  if (error instanceof AxiosError && error.response?.data) {
    return error.response.data as ApiErrorResponseDto;
  }
  return {
    message: "Error de conexión. Revisa tu red e intenta de nuevo.",
    message_code: "NETWORK_ERROR",
    status_code: 0,
    status: "NETWORK_ERROR",
  };
}

// ─── Auth service ─────────────────────────────────────────────────────────────

export async function login(data: LoginRequestDto): Promise<LoginResponseDto> {
  try {
    const response = await authAxios.post<LoginResponseDto>(
      `${BASE_PATH}/login`,
      data
    );
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

export async function signup(
  data: SignupRequestDto
): Promise<SignupResponseDto> {
  try {
    const response = await authAxios.post<SignupResponseDto>(
      `${BASE_PATH}/signup`,
      data
    );
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

export async function forgotPassword(
  data: ForgotPasswordRequestDto
): Promise<ForgotPasswordResponseDto> {
  try {
    const response = await authAxios.post<ForgotPasswordResponseDto>(
      `${BASE_PATH}/forgot-password`,
      data
    );
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

// accessToken opcional:
//   - Con token: se usa al hacer login (SecureStore aún no tiene el token)
//   - Sin token: el interceptor lo lee de SecureStore (restauración de sesión)
export async function getMe(accessToken?: string): Promise<MeResponseDto> {
  try {
    const config = accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : {};
    const response = await httpClient.get<MeResponseDto>(`${BASE_PATH}/me`, config);
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}
