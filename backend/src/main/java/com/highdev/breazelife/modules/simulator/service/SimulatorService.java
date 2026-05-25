package com.highdev.breazelife.modules.simulator.service;

import com.highdev.breazelife.modules.simulator.dto.request.SimulatorRequest;
import com.highdev.breazelife.modules.simulator.dto.response.SimulatorResponse;
import com.highdev.breazelife.modules.simulator.dto.response.SimulatorResponse.MonthlyGrowth;
import com.highdev.breazelife.modules.simulator.dto.response.SimulatorResponse.SimulatorSummary;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * BLIFE-16 / BLIFE-64
 *
 * Lógica del simulador de pensión obligatoria.
 *
 * Fórmulas del proyecto (según documento BreazeLife S.A.):
 *
 * Tasa mensual:
 *   CONSERVATIVE → 0.4% (0.004)
 *   MODERATE     → 0.6% (0.006)
 *   RISKY        → 0.8% (0.008)
 *
 * Proyección de saldo futuro:
 *   Saldo futuro = Saldo actual × (1 + tasa)^meses
 *                + Cotización mensual × [((1 + tasa)^meses - 1) / tasa]
 *
 * Cotización mensual = IBC × 0.16 (16% total)
 *
 * Mesada mensual estimada:
 *   Mesada = Saldo futuro / 240 meses
 *
 * Semanas cotizadas proyectadas:
 *   Semanas actuales + (meses restantes × 30 / 7)
 */
@Service
public class SimulatorService {

    // ── Tasas mensuales por tipo de fondo ─────────────────────────────────────
    private static final double RATE_CONSERVATIVE = 0.004;
    private static final double RATE_MODERATE     = 0.006;
    private static final double RATE_RISKY        = 0.008;

    // ── Constantes del sistema pensional colombiano ───────────────────────────
    private static final double WEEKS_REQUIRED    = 1300.0;
    private static final double MONTHS_PENSION    = 240.0;
    private static final double CONTRIBUTION_RATE = 0.16;
    private static final double DAYS_PER_MONTH    = 30.0;
    private static final double DAYS_PER_WEEK     = 7.0;

    // ── Simular pensión ───────────────────────────────────────────────────────

    /**
     * Calcula la proyección de pensión del afiliado.
     *
     * @param request datos del afiliado y parámetros de simulación
     * @return proyección completa con resumen y datos mes a mes
     */
    public SimulatorResponse simulate(SimulatorRequest request) {
        validateAges(request);

        double monthlyRate       = getMonthlyRate(request.accountType());
        int    monthsRemaining   = calculateMonthsRemaining(
            request.currentAge(), request.retirementAge());
        double monthlyContrib    = request.expectedMonthlySalary() * CONTRIBUTION_RATE;

        // Saldo futuro proyectado
        double futureBalance = calculateFutureBalance(
            request.currentBalance(), monthlyRate,
            monthsRemaining, monthlyContrib);

        // Mesada mensual estimada
        double monthlyPension = futureBalance / MONTHS_PENSION;

        // Semanas proyectadas al retiro
        double currentWeeks  = request.currentQuotedDays() / DAYS_PER_WEEK;
        double weeksToAdd    = (monthsRemaining * DAYS_PER_MONTH) / DAYS_PER_WEEK;
        double totalWeeks    = currentWeeks + weeksToAdd;
        double weeksNeeded   = Math.max(0, WEEKS_REQUIRED - totalWeeks);
        boolean canRetire    = totalWeeks >= WEEKS_REQUIRED;

        // Datos mes a mes para la gráfica
        List<MonthlyGrowth> growthData = calculateGrowthData(
            request.currentBalance(), monthlyRate,
            monthlyContrib, monthsRemaining);

        SimulatorSummary summary = new SimulatorSummary(
            monthsRemaining,
            Math.round(futureBalance * 100.0) / 100.0,
            Math.round(monthlyPension * 100.0) / 100.0,
            Math.round(totalWeeks * 100.0) / 100.0,
            Math.round(weeksNeeded * 100.0) / 100.0,
            canRetire,
            monthlyRate,
            translateAccountType(request.accountType())
        );

        return new SimulatorResponse(summary, growthData);
    }

    // ── Cálculos internos ─────────────────────────────────────────────────────

    /**
     * Fórmula oficial del proyecto:
     * Saldo futuro = Saldo actual × (1 + tasa)^meses
     *              + Cotización mensual × [((1 + tasa)^meses - 1) / tasa]
     */
    private double calculateFutureBalance(double currentBalance,
                                          double monthlyRate,
                                          int months,
                                          double monthlyContrib) {
        double growthFactor = Math.pow(1 + monthlyRate, months);
        double balanceGrowth = currentBalance * growthFactor;
        double contribGrowth = monthlyContrib * ((growthFactor - 1) / monthlyRate);
        return balanceGrowth + contribGrowth;
    }

    /**
     * Genera los datos mes a mes para la gráfica de proyección.
     * BLIFE-64 — datos de crecimiento del simulador pensional.
     */
    private List<MonthlyGrowth> calculateGrowthData(double currentBalance,
                                                    double monthlyRate,
                                                    double monthlyContrib,
                                                    int totalMonths) {
        List<MonthlyGrowth> growthData = new ArrayList<>();
        double balance = currentBalance;

        LocalDate today    = LocalDate.now();
        int       baseYear = today.getYear();
        int       baseMonth = today.getMonthValue();

        for (int i = 1; i <= totalMonths; i++) {
            // Aplicar rentabilidad del mes
            balance = balance * (1 + monthlyRate) + monthlyContrib;

            // Calcular año y mes correspondiente
            int totalMonth = baseMonth + i - 1;
            int year       = baseYear + (totalMonth / 12);
            int month      = (totalMonth % 12) + 1;

            growthData.add(new MonthlyGrowth(
                i,
                year,
                Math.round(balance * 100.0) / 100.0
            ));
        }

        return growthData;
    }

    private int calculateMonthsRemaining(int currentAge, int retirementAge) {
        return (retirementAge - currentAge) * 12;
    }

    private double getMonthlyRate(String accountType) {
        if (accountType == null) return RATE_MODERATE;
        return switch (accountType.toUpperCase()) {
            case "CONSERVATIVE" -> RATE_CONSERVATIVE;
            case "RISKY"        -> RATE_RISKY;
            default             -> RATE_MODERATE;
        };
    }

    private String translateAccountType(String type) {
        if (type == null) return "Moderado";
        return switch (type.toUpperCase()) {
            case "CONSERVATIVE" -> "Conservador";
            case "RISKY"        -> "Mayor Riesgo";
            default             -> "Moderado";
        };
    }

    private void validateAges(SimulatorRequest request) {
        if (request.retirementAge() <= request.currentAge()) {
            throw new IllegalArgumentException(
                "Retirement age must be greater than current age");
        }
    }
}