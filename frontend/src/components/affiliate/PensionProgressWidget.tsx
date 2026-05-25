import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { ProgressResponseDto } from "@/src/dtos/affiliate/affiliate.dtos";

interface PensionProgressWidgetProps {
  data: ProgressResponseDto;
}

export default function PensionProgressWidget({ data }: PensionProgressWidgetProps) {
  return (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>Tu Progreso Pensional</Text>
      <Text style={styles.subtitle}>Meta legal: 1.300 semanas</Text>

      {/* Barra de progreso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${data.progressPercentage}%` },
            ]}
          />
        </View>
        <Text style={styles.percentageText}>
          {data.progressPercentage}% completado
        </Text>
      </View>

      {/* Tarjetas de Resumen */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, styles.statBoxSuccess]}>
          <Text style={styles.statLabel}>Acumuladas</Text>
          <Text style={styles.statValueSuccess}>{data.accumulatedWeeks}</Text>
        </View>

        <View style={[styles.statBox, styles.statBoxWarning]}>
          <Text style={styles.statLabel}>Faltantes</Text>
          <Text style={styles.statValueWarning}>{data.missingWeeks}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2563eb", // Azul BreazeLife
    borderRadius: 5,
  },
  percentageText: {
    textAlign: "right",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  statBoxSuccess: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  statBoxWarning: {
    backgroundColor: "#fffbeb",
    borderColor: "#fef08a",
  },
  statLabel: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 4,
  },
  statValueSuccess: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#166534",
  },
  statValueWarning: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#854d0e",
  },
});