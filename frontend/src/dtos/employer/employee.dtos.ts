export type PensionFundType = "CONSERVATIVE" | "MODERATE" | "HIGH_RISK";

export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export type RegisterEmployeeDto = {
    firstName: string;
    lastName: string;
    email: string;
    document: string;
    birthDate: string;  // "YYYY-MM-DD"
    position: string;
    baseSalary: number;
    pensionFundType: PensionFundType;
    startDate: string;  // "YYYY-MM-DD"
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

export type EmployerEmployeeDto = {
    contractId: string;
    firstName: string;
    lastName: string;
    email: string;
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

export type EmployeeDetailDto = {
    contractId: string;
    affiliateId: string;
    employerId: string;
    companyName: string;
    firstName: string;
    lastName: string;
    email: string;
    document: string;
    birthDate: string;
    position: string;
    baseSalary: number;
    startDate: string;
    endDate: string | null;
    status: EmployeeStatus;
};

export type EmployeeListParamsDto = {
    page?: number;
    size?: number;
    status?: EmployeeStatus;
};