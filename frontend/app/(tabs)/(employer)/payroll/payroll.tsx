import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppHeader from "@/src/components/common/AppHeader";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import PayrollEmployeeCard from "@/src/components/employer/payrollEmployeeCard";
import EmployerScreenContainer from "@/src/components/layout/EmployerScreenContainer";
import { executePayroll, previewPayroll, getPayrollHistory } from "@/src/services/api/payrollService";
import type {
  PayrollExecuteDataDto,
  PayrollPreviewDataDto,
} from "@/src/dtos/employer/employer.dtos";
import { formatCurrency } from "@/src/utils/formatters";
import { colors, formStyles, spacing, typography } from "@/src/theme";

const MONTHS = [
  { label: "Ene", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Abr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Ago", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dic", value: 12 },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR];

type ScreenView = "selector" | "preview" | "confirm" | "result";

function getMonthLabel(month: number): string {
  return MONTHS.find((item) => item.value === month)?.label ?? "";
}

export default function EmployerPayrollScreen() {
  const router = useRouter();
  const [view, setView] = useState<ScreenView>("selector");
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [processedPeriods, setProcessedPeriods] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PayrollPreviewDataDto | null>(null);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);
  const [result, setResult] = useState<PayrollExecuteDataDto | null>(null);

  const fetchProcessedPeriods = useCallback(async () => {
    try {
      const res = await getPayrollHistory({ limit: 100 });
      const periods = (res.data.items || []).map((item) => item.period);
      setProcessedPeriods(periods);
    } catch {
      setProcessedPeriods([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProcessedPeriods();
    }, [fetchProcessedPeriods])
  );

  const period = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const periodLabel = `${getMonthLabel(selectedMonth)} ${selectedYear}`;

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const res = await previewPayroll({ period });
      setPreview(res.data);
      setView("preview");
    } catch (err) {
      const code = (err as any)?.response?.data?.message_code;
      if (code === "NO_ACTIVE_EMPLOYEES") {
        setPreviewError("No tienes empleados activos para este periodo.");
      } else if (code === "PAYROLL_ALREADY_PROCESSED") {
        setPreviewError("La nomina de este periodo ya fue procesada.");
      } else {
        setPreviewError("No se pudo generar la vista previa. Intenta de nuevo.");
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExecute = async () => {
    setExecuteLoading(true);
    setExecuteError(null);
    try {
      const res = await executePayroll({ period });
      setResult(res.data);
      setView("result");
      fetchProcessedPeriods();
    } catch (err) {
      const code = (err as any)?.response?.data?.message_code;
      if (code === "INSUFFICIENT_FUNDS") {
        setExecuteError("Fondos insuficientes para ejecutar la nomina.");
      } else if (code === "PAYROLL_ALREADY_PROCESSED") {
        setExecuteError("La nomina de este periodo ya fue procesada.");
      } else if (code === "NO_ACTIVE_EMPLOYEES") {
        setExecuteError("No hay empleados activos para ejecutar.");
      } else {
        setExecuteError("No se pudo ejecutar la nomina. Intenta de nuevo.");
      }
    } finally {
      setExecuteLoading(false);
    }
  };

  const handleReset = () => {
    setView("selector");
    setPreview(null);
    setPreviewError(null);
    setResult(null);
    setExecuteError(null);
  };

  if (view === "result" && result) {
    return (
      <EmployerScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <AppHeader
            title="Nomina ejecutada"
            subtitle={`${periodLabel} · ${result.company_name}`}
            rightSlot={<AppStatusBadge label="Procesada" tone="success" />}
          />

          <AppCard variant="tint">
            <Text style={styles.sectionTitle}>Saldos restantes</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Fondo nomina</Text>
                <Text style={styles.gridValue}>{formatCurrency(result.payroll_fund_remaining)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Fondo pension</Text>
                <Text style={styles.gridValue}>{formatCurrency(result.pension_fund_remaining)}</Text>
              </View>
            </View>
          </AppCard>

          <AppCard>
            <Text style={styles.sectionTitle}>Resumen</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Empleados pagados</Text>
                <Text style={styles.gridValue}>{result.totals.total_employees}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Total neto pagado</Text>
                <Text style={styles.gridValue}>
                  {formatCurrency(result.totals.total_net_salary_paid)}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Total pension</Text>
                <Text style={styles.gridValue}>
                  {formatCurrency(result.totals.total_pension_contrib)}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Total debitado</Text>
                <Text style={[styles.gridValue, styles.primaryText]}>
                  {formatCurrency(result.totals.total_debit)}
                </Text>
              </View>
            </View>
          </AppCard>

          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Pagos procesados ({result.payments.length})</Text>
            {result.payments.map((payment) => {
              const baseSalary = payment.net_salary / 0.96;
              return (
                <PayrollEmployeeCard
                  key={payment.payment_id}
                  data={{
                    affiliate_name: payment.affiliate_name,
                    document: payment.document,
                    base_salary: baseSalary,
                    employee_pension_deduction: baseSalary * 0.04,
                    net_salary: payment.net_salary,
                    employer_pension_contrib: baseSalary * 0.12,
                    quote_id: payment.quote_id,
                    status: payment.status,
                  }}
                />
              );
            })}
          </View>

          <AppButton title="Nueva nomina" onPress={handleReset} />
        </ScrollView>
      </EmployerScreenContainer>
    );
  }

  if (view === "confirm" && preview) {
    return (
      <EmployerScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.topBar}>
            <AppButton
              title="Volver a vista previa"
              variant="secondary"
              iconName="arrow-back-outline"
              onPress={() => {
                setExecuteError(null);
                setView("preview");
              }}
            />
          </View>

          <AppHeader
            title="Confirmar ejecucion"
            subtitle={`${periodLabel} · ${preview.company_name}`}
          />

          <AppCard>
            <Text style={styles.confirmQuestion}>
              Confirma la ejecucion de la nomina para <Text style={styles.boldText}>{periodLabel}</Text>.
            </Text>
            <Text style={styles.confirmWarning}>
              Esta accion debitara los fondos y registrara los pagos de {preview.totals.total_employees} empleado{preview.totals.total_employees !== 1 ? "s" : ""}.
            </Text>

            <View style={styles.divider} />

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Total a pagar</Text>
                <Text style={styles.gridValue}>
                  {formatCurrency(preview.totals.total_net_salary)}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Total pension</Text>
                <Text style={styles.gridValue}>
                  {formatCurrency(preview.totals.total_pension_contrib)}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Total a debitar</Text>
                <Text style={[styles.gridValue, styles.primaryText]}>
                  {formatCurrency(preview.totals.total_debit)}
                </Text>
              </View>
            </View>
          </AppCard>

          {executeError ? (
            <AppCard variant="muted">
              <Text style={styles.errorText}>{executeError}</Text>
            </AppCard>
          ) : null}

          <AppButton title="Confirmar y ejecutar" onPress={handleExecute} loading={executeLoading} />
          <AppButton
            title="Cancelar"
            variant="secondary"
            onPress={() => {
              setExecuteError(null);
              setView("preview");
            }}
            disabled={executeLoading}
          />
        </ScrollView>
      </EmployerScreenContainer>
    );
  }

  if (view === "preview" && preview) {
    return (
      <EmployerScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.topBar}>
            <AppButton
              title="Cambiar periodo"
              variant="secondary"
              iconName="arrow-back-outline"
              onPress={() => setView("selector")}
            />
          </View>

          <AppHeader
            title={periodLabel}
            subtitle={preview.company_name}
            rightSlot={
              <AppStatusBadge
                label={preview.fund_status.can_execute ? "Fondos listos" : "Fondos insuficientes"}
                tone={preview.fund_status.can_execute ? "success" : "warning"}
              />
            }
          />

          <AppCard variant={preview.fund_status.can_execute ? "tint" : "muted"}>
            <Text style={styles.sectionTitle}>Estado de fondos</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Fondo nomina</Text>
                <Text
                  style={[
                    styles.gridValue,
                    !preview.fund_status.payroll_fund_sufficient ? styles.dangerText : null,
                  ]}
                >
                  {formatCurrency(preview.payroll_fund_balance)}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Fondo pension</Text>
                <Text
                  style={[
                    styles.gridValue,
                    !preview.fund_status.pension_fund_sufficient ? styles.dangerText : null,
                  ]}
                >
                  {formatCurrency(preview.pension_fund_balance)}
                </Text>
              </View>
            </View>
          </AppCard>

          <AppCard>
            <Text style={styles.sectionTitle}>Resumen</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Empleados</Text>
                <Text style={styles.gridValue}>{preview.totals.total_employees}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Total neto</Text>
                <Text style={styles.gridValue}>
                  {formatCurrency(preview.totals.total_net_salary)}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Total pension</Text>
                <Text style={styles.gridValue}>
                  {formatCurrency(preview.totals.total_pension_contrib)}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Total debito</Text>
                <Text style={[styles.gridValue, styles.primaryText]}>
                  {formatCurrency(preview.totals.total_debit)}
                </Text>
              </View>
            </View>
          </AppCard>

          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Empleados ({preview.employees.length})</Text>
            {preview.employees.map((employee) => (
              <PayrollEmployeeCard key={employee.contract_id} data={employee} />
            ))}
          </View>

          {preview.fund_status.can_execute ? (
            <AppButton title="Ejecutar nomina" onPress={() => setView("confirm")} />
          ) : null}
        </ScrollView>
      </EmployerScreenContainer>
    );
  }

  return (
    <EmployerScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppHeader
          title="Nomina"
          subtitle="Selecciona el periodo, revisa la vista previa y ejecuta la nomina cuando los fondos esten listos."
        />

        <AppCard>
          <Text style={styles.sectionTitle}>Ano</Text>
          <View style={styles.chipsRow}>
            {YEARS.map((year) => (
              <TouchableOpacity
                key={year}
                style={[styles.chip, selectedYear === year ? styles.chipActive : null]}
                onPress={() => setSelectedYear(year)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedYear === year ? styles.chipTextActive : null,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Mes</Text>
          <View style={styles.monthsGrid}>
            {MONTHS.map((month) => {
              const currentPeriod = `${selectedYear}-${String(month.value).padStart(2, "0")}`;
              const isProcessed = processedPeriods.includes(currentPeriod);

              return (
                <TouchableOpacity
                  key={month.value}
                  style={[
                    styles.monthChip,
                    selectedMonth === month.value ? styles.chipActive : null,
                    isProcessed ? styles.chipDisabled : null,
                  ]}
                  onPress={() => !isProcessed && setSelectedMonth(month.value)}
                  disabled={isProcessed}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedMonth === month.value ? styles.chipTextActive : null,
                      isProcessed ? styles.chipTextDisabled : null,
                    ]}
                  >
                    {month.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </AppCard>

        {previewError ? (
          <AppCard variant="muted">
            <Text style={styles.errorText}>{previewError}</Text>
          </AppCard>
        ) : null}

        <AppButton title="Previsualizar nomina" onPress={handlePreview} loading={previewLoading} />
        <AppButton
          title="Ver historial de nominas"
          variant="secondary"
          onPress={() => router.push("/(tabs)/(employer)/payroll/history" as any)}
        />
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
  chipsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: formStyles.chip,
  chipActive: formStyles.chipActive,
  chipText: formStyles.chipText,
  chipTextActive: formStyles.chipTextActive,
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  monthChip: {
    ...formStyles.chip,
    flexBasis: "22%",
    flexGrow: 1,
    maxWidth: "25%",
    alignItems: "center",
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipTextDisabled: {
    color: colors.textSubtle,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 136,
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
  primaryText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.dangerText,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  confirmQuestion: {
    ...typography.bodyStrong,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  confirmWarning: {
    ...typography.body,
    color: colors.textMuted,
  },
  boldText: {
    fontWeight: "700",
  },
  errorText: {
    ...typography.body,
    color: colors.dangerText,
  },
  listSection: {
    gap: spacing.sm,
  },
});
