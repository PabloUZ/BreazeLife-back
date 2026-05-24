export type EmployeeStatus = "ACTIVE" | "INACTIVE";

// ─── Register ─────────────────────────────────────────────────────────────────

export type RegisterEmployeeDto = {
    firstName: string;
    lastName: string;
    email: string;
    document: string;
    birthDate: string;   // "YYYY-MM-DD"
    position: string;
    baseSalary: number;
    startDate: string;   // "YYYY-MM-DD"
};

export type RegisterEmployeeResponseDto = {
    contractId: string;
    affiliateId: string;
    employerId: string;
    firstName: string;
    lastName: string;
    email: string;
    document: string;
    birthDate: string;
    position: string;
    baseSalary: number;
    startDate: string;
    status: EmployeeStatus;
    createdAt: string;
};

// ─── List ─────────────────────────────────────────────────────────────────────

export type EmployerEmployeeDto = {
    contractId: string;
    affiliateId: string;
    firstName: string;
    lastName: string;
    document: string;
    position: string;
    baseSalary: number;
    startDate: string;
    status: EmployeeStatus;
};

export type EmployeeListResponseDto = {
    content: EmployerEmployeeDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
};

export type EmployeeListParamsDto = {
    page?: number;
    size?: number;
    status?: EmployeeStatus;
};
