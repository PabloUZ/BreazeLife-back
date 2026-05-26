import { StyleSheet, Text, View } from "react-native";
import AppCard from "@/src/components/common/AppCard";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import type { PayslipDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { colors, spacing, typography } from "@/src/theme";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function PayslipCard({ payslip }: { payslip: PayslipDto }) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerCopy}>
          <Text style={styles.dateText}>Periodo: {payslip.period}</Text>
        </View>
        <AppStatusBadge label={payslip.status} tone="success" />
      </View>

      <View style={styles.salaryRow}>
        <Text style={styles.label}>Salario bruto</Text>
        <Text style={styles.grossValue}>{formatCurrency(payslip.grossSalary)}</Text>
      </View>
      <View style={styles.salaryRow}>
        <Text style={styles.label}>Salario neto</Text>
        <Text style={styles.netValue}>
          {formatCurrency(payslip.netSalaryReceived)}
        </Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Detalle de aportes</Text>
      <View style={styles.salaryRow}>
        <Text style={styles.label}>Tu deduccion (4%)</Text>
        <Text style={styles.valueText}>{formatCurrency(payslip.pensionDeduction)}</Text>
      </View>
      <View style={styles.salaryRow}>
        <Text style={styles.label}>Aporte empresa</Text>
        <Text style={styles.valueText}>{formatCurrency(payslip.employerContrib)}</Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  headerCopy: {
    flex: 1,
  },
  dateText: {
    ...typography.bodyStrong,
    color: colors.text,
    textTransform: "capitalize",
    flexShrink: 1,
  },
  salaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
  },
  grossValue: {
    ...typography.bodyStrong,
    color: colors.neutralText,
    flexShrink: 1,
    textAlign: "right",
  },
  netValue: {
    ...typography.cardTitle,
    color: colors.success,
    flexShrink: 1,
    textAlign: "right",
  },
  valueText: {
    ...typography.bodyStrong,
    color: colors.neutralText,
    flexShrink: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSubtle,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
});
