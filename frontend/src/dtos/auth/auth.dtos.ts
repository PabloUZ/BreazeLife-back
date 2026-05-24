// ─── Login ───────────────────────────────────────────────────────────────────

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  message: string;
  status_code: number;
  status: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
};

// ─── Signup ───────────────────────────────────────────────────────────────────

export type UserRole = "AFFILIATE" | "EMPLOYER" | "ADMIN";

export type SignupRequestDto = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type SignupResponseDto = {
  message: string;
  status_code: number;
  status: string;
  data: {
    user_id: string;
    email: string;
    verified: boolean;
  };
};

// ─── Me ──────────────────────────────────────────────────────────────────────

export type MeDto = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  verified: boolean;
};

export type MeResponseDto = {
  message: string;
  status_code: number;
  status: string;
  data: MeDto;
};

// ─── Forgot Password ─────────────────────────────────────────────────────────

export type ForgotPasswordRequestDto = {
  email: string;
};

export type ForgotPasswordResponseDto = {
  message: string;
  status_code: number;
  status: string;
};

// ─── Error ───────────────────────────────────────────────────────────────────

export type ApiErrorResponseDto = {
  message: string;
  message_code: string;
  status_code: number;
  status: string;
  /** Presente en errores INVALID_INPUT: claves = nombre del campo, valor = motivo en inglés */
  details?: Record<string, string>;
};
