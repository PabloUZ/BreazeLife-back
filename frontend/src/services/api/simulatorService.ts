import { httpClient } from "@/src/config/http";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type AccountType = "CONSERVATIVE" | "MODERATE" | "RISKY";

export type SimulatorRequest = {
    currentAge: number;
    retirementAge: number;
    expectedMonthlySalary: number;
    accountType: AccountType;
    currentBalance: number;
    currentQuotedDays: number;
};

export type MonthlyGrowth = {
    month: number;
    year: number;
    balance: number;
};

export type SimulatorSummary = {
    monthsRemaining: number;
    futureBalance: number;
    monthlyPension: number;
    totalWeeksAtRetirement: number;
    weeksStillNeeded: number;
    canRetire: boolean;
    monthlyRate: number;
    accountType: string;
};

export type SimulatorResponse = {
    summary: SimulatorSummary;
    growthData: MonthlyGrowth[];
};

// ── Servicio ──────────────────────────────────────────────────────────────────

/**
 * BLIFE-16 / BLIFE-65 — Calcula la proyección pensional del afiliado.
 * Retorna resumen y datos mes a mes para la gráfica.
 */
export const simulatePension = async (
    request: SimulatorRequest
): Promise<SimulatorResponse> => {
    const response = await httpClient.post<{
        data: SimulatorResponse;
    }>("/api/v1/affiliates/simulator", request);
    return response.data.data;
};