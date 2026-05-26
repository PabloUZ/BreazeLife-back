export type ApiMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type ApiRequestConfig = {
  body?: unknown;
  endpoint: string;
  headers?: Record<string, string>;
  method?: ApiMethod;
};

export class ApiClient {
  async request<TResponse>(config: ApiRequestConfig): Promise<TResponse> {
    throw new Error(
      `ApiClient.request: usa los servicios (employeeService, authService, etc.) en lugar de ApiClient directamente. Endpoint: ${config.endpoint}`
    );
  }
}

export const apiClient = new ApiClient();