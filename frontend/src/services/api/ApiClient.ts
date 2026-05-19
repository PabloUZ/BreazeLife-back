export type ApiMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type ApiRequestConfig = {
  body?: unknown;
  endpoint: string;
  headers?: Record<string, string>;
  method?: ApiMethod;
};

export class ApiClient {
  async request<TResponse>(_config: ApiRequestConfig): Promise<TResponse> {
    // TODO: Implement API integration, interceptors and auth headers.
    throw new Error("ApiClient.request is a placeholder.");
  }
}

export const apiClient = new ApiClient();
