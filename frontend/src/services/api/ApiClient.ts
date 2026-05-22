export type ApiMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type ApiRequestConfig = {
  body?: unknown;
  endpoint: string;
  headers?: Record<string, string>;
  method?: ApiMethod;
};

// Mock data temporal para desarrollo visual
const MOCK_EMPLOYEES = {
  content: [
    {
      contractId: "1",
      firstName: "Laura",
      lastName: "Martínez",
      email: "laura@test.com",
      document: "1234567890",
      position: "Desarrolladora Frontend",
      baseSalary: 4500000,
      startDate: "2024-01-15",
      status: "ACTIVE" as const,
    },
    {
      contractId: "2",
      firstName: "Carlos",
      lastName: "Gómez",
      email: "carlos@test.com",
      document: "0987654321",
      position: "Diseñador UX",
      baseSalary: 3800000,
      startDate: "2023-06-01",
      status: "ACTIVE" as const,
    },
    {
      contractId: "3",
      firstName: "Ana",
      lastName: "Torres",
      email: "ana@test.com",
      document: "1122334455",
      position: "Analista de Datos",
      baseSalary: 5200000,
      startDate: "2022-03-10",
      status: "INACTIVE" as const,
    },
  ],
  totalElements: 3,
  totalPages: 1,
  number: 0,
  size: 10,
  first: true,
  last: true,
};

export class ApiClient {
  async request<TResponse>(config: ApiRequestConfig): Promise<TResponse> {
    // Mock temporal — reemplazar cuando el ApiClient real esté listo
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (config.method === "GET" && config.endpoint.includes("/employees")) {
      const url = config.endpoint;
      const statusMatch = url.match(/status=([A-Z]+)/);
      const filterStatus = statusMatch ? statusMatch[1] : null;

      const filtered = filterStatus
        ? MOCK_EMPLOYEES.content.filter((e) => e.status === filterStatus)
        : MOCK_EMPLOYEES.content;

      return {
        ...MOCK_EMPLOYEES,
        content: filtered,
        totalElements: filtered.length,
      } as TResponse;
    }

    if (config.method === "POST" && config.endpoint.includes("/employees")) {
      const body = config.body as Record<string, unknown>;
      return {
        contractId: Math.random().toString(36).slice(2),
        affiliateId: Math.random().toString(36).slice(2),
        employerId: "placeholder-employer-id",
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        document: body.document,
        birthDate: body.birthDate,
        position: body.position,
        baseSalary: body.baseSalary,
        startDate: body.startDate,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      } as TResponse;
    }

    throw new Error("ApiClient.request: endpoint not mocked.");
  }
}

export const apiClient = new ApiClient();