export type ApiMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type ApiRequestConfig = {
  body?: unknown;
  endpoint: string;
  headers?: Record<string, string>;
  method?: ApiMethod;
};

// Reemplazar con implementación real cuando el módulo de auth esté listo

const MOCK_EMPLOYEES_BASE: {
  contractId: string;
  firstName: string;
  lastName: string;
  email: string;
  document: string;
  position: string;
  baseSalary: number;
  startDate: string;
  birthDate: string;
  status: "ACTIVE" | "INACTIVE";
}[] = [
  {
    contractId: "1",
    firstName: "Laura",
    lastName: "Martínez",
    email: "laura@test.com",
    document: "1234567890",
    position: "Desarrolladora Frontend",
    baseSalary: 4500000,
    startDate: "2024-01-15",
    birthDate: "1995-03-22",
    status: "ACTIVE",
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
    birthDate: "1990-07-15",
    status: "ACTIVE",
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
    birthDate: "1988-11-30",
    status: "INACTIVE",
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

    if (config.method === "GET" && config.endpoint.includes("/employee-detail/")) {
      const parts = config.endpoint.split("/");
      const contractId = parts[parts.length - 1];
      const found = mockEmployees.find((e) => e.contractId === contractId);

      if (!found) {
        throw new Error("EMPLOYEE_NOT_FOUND");
      }

      return {
        contractId: found.contractId,
        affiliateId: "affiliate-" + found.contractId,
        employerId: "placeholder-employer-id",
        companyName: "BreazeLife S.A.",
        firstName: found.firstName,
        lastName: found.lastName,
        email: found.email,
        document: found.document,
        birthDate: found.birthDate || "1990-01-01",
        position: found.position,
        baseSalary: found.baseSalary,
        startDate: found.startDate,
        endDate: null,
        status: found.status,
      } as TResponse;
    }

    if (config.method === "PUT" && config.endpoint.includes("/update-employee/")) {
      const parts = config.endpoint.split("/");
      const contractId = parts[parts.length - 1];
      const body = config.body as Record<string, unknown>;

      const index = mockEmployees.findIndex((e) => e.contractId === contractId);

      if (index === -1) {
        throw new Error("EMPLOYEE_NOT_FOUND");
      }

      mockEmployees[index] = {
        ...mockEmployees[index],
        firstName: body.firstName as string,
        lastName: body.lastName as string,
        email: body.email as string,
        birthDate: body.birthDate as string,
      };

      return {
        contractId: mockEmployees[index].contractId,
        affiliateId: "affiliate-" + mockEmployees[index].contractId,
        employerId: "placeholder-employer-id",
        firstName: mockEmployees[index].firstName,
        lastName: mockEmployees[index].lastName,
        email: mockEmployees[index].email,
        document: mockEmployees[index].document,
        birthDate: mockEmployees[index].birthDate,
        position: mockEmployees[index].position,
        baseSalary: mockEmployees[index].baseSalary,
        startDate: mockEmployees[index].startDate,
        status: mockEmployees[index].status,
      } as TResponse;
    }

    throw new Error("ApiClient.request: endpoint not mocked.");
  }
}

export const apiClient = new ApiClient();