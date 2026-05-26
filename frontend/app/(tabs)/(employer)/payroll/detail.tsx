import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import PayrollEmployeeCard from "@/src/components/employer/payrollEmployeeCard";
import EmployerScreenContainer from "@/src/components/layout/EmployerScreenContainer";
import type { PayrollDetailDataDto } from "@/src/dtos/employer/employer.dtos";
import { getPayrollDetail } from "@/src/services/api/payrollService";
import { formatCurrency, formatPeriod, formatDate } from "@/src/utils/formatters";
import { colors, spacing, typography } from "@/src/theme";

export default function EmployerPayrollDetailScreen() {
  const router = useRouter();
  const { payrollId } = useLocalSearchParams<{ payrollId: string }>();

  const [detail, setDetail] = useState<PayrollDetailDataDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!payrollId) {
      setError("Falta el identificador de la nomina.");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPayrollDetail(payrollId);
        setDetail(res.data);
      } catch {
        setError("No se pudo cargar el detalle de la nomina. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [payrollId]);

  if (loading) {
    return (
      <EmployerScreenContainer>
        <AppLoadingState message="Cargando detalle de nomina..." />
      </EmployerScreenContainer>
    );
  }

  if (error || !detail) {
    return (
      <EmployerScreenContainer>
        <AppErrorState message={error ?? "No se encontro esta nomina."} onRetry={() => router.back()} />
      </EmployerScreenContainer>
    );
  }

  return (
    <EmployerScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <AppButton
            title="Volver"
            variant="secondary"
            iconName="arrow-back-outline"
            onPress={() => router.back()}
          />
        </View>

        <AppHeader
          title={`Nomina ${formatPeriod(detail.period)}`}
          subtitle={`${detail.company_name} · Ejecutada ${formatDate(detail.executed_at)}`}
          rightSlot={
            <AppStatusBadge
              label={detail.status === "PROCESSED" ? "Procesada" : detail.status}
              tone={detail.status === "PROCESSED" ? "success" : "warning"}
            />
          }
        />

        <AppCard>
          <Text style={styles.sectionTitle}>Totales de la operacion</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Empleados pagados</Text>
              <Text style={styles.gridValue}>{detail.totals.total_employees}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Total bruto</Text>
              <Text style={styles.gridValue}>
                {formatCurrency(detail.totals.total_gross_salary)}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Deduccion pension</Text>
              <Text style={[styles.gridValue, styles.dangerText]}>
                - {formatCurrency(detail.totals.total_employee_pension_deduction)}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Salario neto</Text>
              <Text style={[styles.gridValue, styles.successText]}>
                {formatCurrency(detail.totals.total_net_salary)}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Aporte patronal</Text>
              <Text style={styles.gridValue}>
                {formatCurrency(detail.totals.total_employer_pension_contrib)}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Total cotizado</Text>
              <Text style={styles.gridValue}>
                {formatCurrency(detail.totals.total_pension_contrib)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Total debito de fondos</Text>
            <Text style={styles.footerValue}>
              {formatCurrency(detail.totals.total_debit)}
            </Text>
          </View>
        </AppCard>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Desglose de pagos ({detail.payments.length})</Text>
          {detail.payments.map((payment) => (
            <PayrollEmployeeCard key={payment.payment_id} data={payment} />
          ))}
        </View>
      </ScrollView>
    </EmployerScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  topBar: {
    alignItems: "flex-start",
  },
  sectionTitle: {
    ...typography.bodyStrong,
    color: colors.neutralText,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 132,
  },
  gridLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: spacing.xs,
  },
  gridValue: {
    ...typography.bodyStrong,
    color: colors.neutralText,
  },
  dangerText: {
    color: colors.dangerText,
  },
  successText: {
    color: colors.successText,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  footerLabel: {
    ...typography.bodyStrong,
    color: colors.text,
    flex: 1,
  },
  footerValue: {
    ...typography.sectionTitle,
    color: colors.primary,
    flexShrink: 1,
    textAlign: "right",
  },
  listSection: {
    gap: spacing.sm,
  },
});
