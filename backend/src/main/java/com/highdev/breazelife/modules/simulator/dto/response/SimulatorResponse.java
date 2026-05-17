package com.highdev.breazelife.modules.simulator.dto.response;

import java.util.List;

/**
 * BLIFE-16 / BLIFE-64 — Response del simulador de pensión.
 *
 * summary:      resumen general de la proyección
 * growthData:   lista mes a mes del crecimiento del saldo (para la gráfica)
 */
public record SimulatorResponse(
    SimulatorSummary summary,
    List<MonthlyGrowth> growthData
) {

    /**
     * Resumen general de la proyección pensional.
     *
     * monthsRemaining:     meses hasta la edad de retiro
     * futureBalance:       saldo proyectado al momento del retiro
     * monthlyPension:      mesada mensual estimada (saldo / 240)
     * totalWeeksAtRetirement: semanas cotizadas proyectadas al retiro
     * weeksStillNeeded:    semanas faltantes para las 1.300 requeridas
     * canRetire:           si alcanza las 1.300 semanas antes del retiro
     * monthlyRate:         tasa mensual aplicada según tipo de fondo
     * accountType:         tipo de fondo en español
     */
    public record SimulatorSummary(
        Integer monthsRemaining,
        Double futureBalance,
        Double monthlyPension,
        Double totalWeeksAtRetirement,
        Double weeksStillNeeded,
        Boolean canRetire,
        Double monthlyRate,
        String accountType
    ) {}

    /**
     * Dato de crecimiento mes a mes para la gráfica del frontend.
     *
     * month:   número de mes desde hoy (1, 2, 3...)
     * year:    año correspondiente
     * balance: saldo proyectado en ese mes
     */
    public record MonthlyGrowth(
        Integer month,
        Integer year,
        Double balance
    ) {}
}