export type ApiMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type ApiRequestConfig = {
  body?: unknown;
  endpoint: string;
  headers?: Record<string, string>;
  method?: ApiMethod;
};

// Reemplazar con implementación real cuando el módulo de auth esté listo

const MOCK_EMPLOYEES_BASE = [
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
];

const mockEmployees = [...MOCK_EMPLOYEES_BASE];

export class ApiClient {
  async request<TResponse>(config: ApiRequestConfig): Promise<TResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (config.method === "GET" && config.endpoint.includes("/employees")) {
      console.log("mockEmployees count:", mockEmployees.length);
      const url = config.endpoint;
      const statusMatch = url.match(/status=([A-Z]+)/);
      const filterStatus = statusMatch ? statusMatch[1] : null;

      const filtered = filterStatus
        ? mockEmployees.filter((e) => e.status === filterStatus)
        : mockEmployees;

      return {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        number: 0,
        size: 10,
        first: true,
        last: true,
      } as TResponse;
    }

    if (config.method === "POST" && config.endpoint.includes("/employees")) {
      const body = config.body as Record<string, unknown>;
      const newEmployee = {
        contractId: Math.random().toString(36).slice(2),
        affiliateId: Math.random().toString(36).slice(2),
        employerId: "placeholder-employer-id",
        firstName: body.firstName as string,
        lastName: body.lastName as string,
        email: body.email as string,
        document: body.document as string,
        birthDate: body.birthDate as string,
        position: body.position as string,
        baseSalary: body.baseSalary as number,
        startDate: body.startDate as string,
        status: "ACTIVE" as const,
        createdAt: new Date().toISOString(),
      };
      mockEmployees.push(newEmployee);
      return newEmployee as TResponse;
    }

    throw new Error("ApiClient.request: endpoint not mocked.");
  }
}

export const apiClient = new ApiClient();