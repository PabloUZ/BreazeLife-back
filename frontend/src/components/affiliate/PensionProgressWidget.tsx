import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppCard from "@/src/components/common/AppCard";
import type { ProgressResponseDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { colors, spacing, typography } from "@/src/theme";

interface PensionProgressWidgetProps {
  data: ProgressResponseDto;
}

export default function PensionProgressWidget({
  data,
}: PensionProgressWidgetProps) {
  const progress = Math.min(Math.max(data.progressPercentage, 0), 100);

  return (
    <AppCard style={styles.cardContainer}>
      <Text style={styles.title}>Tu progreso pensional</Text>
      <Text style={styles.subtitle}>Meta legal: 1.300 semanas</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Avance acumulado</Text>
          <Text style={styles.percentageText}>{progress}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

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
    </AppCard>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  progressContainer: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  percentageText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  statBoxSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: "#BFE8D1",
  },
  statBoxWarning: {
    backgroundColor: colors.warningSoft,
    borderColor: "#F9D58B",
  },
  statLabel: {
    ...typography.caption,
    color: colors.neutralText,
  },
  statValueSuccess: {
    ...typography.sectionTitle,
    color: colors.successText,
  },
  statValueWarning: {
    ...typography.sectionTitle,
    color: colors.warningText,
  },
});
