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
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import { executePayroll, previewPayroll, getPayrollHistory } from "@/src/services/api/payrollService";
import type {
  PayrollExecuteDataDto,
  PayrollPreviewDataDto,
} from "@/src/dtos/employer/employer.dtos";
import { formatCurrency } from "@/src/utils/formatters";
import PayrollEmployeeCard from "@/src/components/employer/payrollEmployeeCard";

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
  return MONTHS.find((m) => m.value === month)?.label ?? "";
}

export default function EmployerPayrollScreen() {
  const router = useRouter();
  const [view, setView] = useState<ScreenView>("selector");
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [processedPeriods, setProcessedPeriods] = useState<string[]>([]);

  const fetchProcessedPeriods = useCallback(async () => {
    try {
      const res = await getPayrollHistory({ limit: 100 });
      const periods = (res.data.items || []).map((item) => item.period);
      setProcessedPeriods(periods);
    } catch {
      // ignore
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProcessedPeriods();
    }, [fetchProcessedPeriods])
  );

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PayrollPreviewDataDto | null>(null);

  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);
  const [result, setResult] = useState<PayrollExecuteDataDto | null>(null);

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
        setPreviewError("No tienes empleados activos para este período.");
      } else if (code === "PAYROLL_ALREADY_PROCESSED") {
        setPreviewError("La nómina de este período ya fue procesada.");
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
        setExecuteError("Fondos insuficientes para ejecutar la nómina.");
      } else if (code === "PAYROLL_ALREADY_PROCESSED") {
        setExecuteError("La nómina de este período ya fue procesada.");
      } else if (code === "NO_ACTIVE_EMPLOYEES") {
        setExecuteError("No hay empleados activos para ejecutar.");
      } else {
        setExecuteError("No se pudo ejecutar la nómina. Intenta de nuevo.");
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

  // ── Result ───────────────────────────────────────────────────────────────
  if (view === "result" && result) {
    return (
      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.successHeader}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Nómina ejecutada</Text>
            <Text style={styles.successPeriod}>{periodLabel}</Text>
            <Text style={styles.successCompany}>{result.company_name}</Text>
          </View>

          {/* Remaining balances */}
          <View style={styles.remainingCard}>
            <Text style={styles.remainingTitle}>Saldos restantes</Text>
            <View style={styles.fundRow}>
              <View style={styles.fundItem}>
                <Text style={styles.fundLabel}>Fondo nómina</Text>
                <Text style={styles.fundValue}>
                  {formatCurrency(result.payroll_fund_remaining)}
                </Text>
              </View>
              <View style={[styles.fundItem, styles.fundItemRight]}>
                <Text style={styles.fundLabel}>Fondo pensión</Text>
                <Text style={styles.fundValue}>
                  {formatCurrency(result.pension_fund_remaining)}
                </Text>
              </View>
            </View>
          </View>

          {/* Totals */}
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.card}>
            <View style={styles.totalsGrid}>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Empleados pagados</Text>
                <Text style={styles.totalValue}>
                  {result.totals.total_employees}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total neto pagado</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(result.totals.total_net_salary_paid)}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total pensión</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(result.totals.total_pension_contrib)}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total debitado</Text>
                <Text style={[styles.totalValue, styles.totalDebit]}>
                  {formatCurrency(result.totals.total_debit)}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment list */}
          <Text style={styles.sectionTitle}>
            Pagos procesados ({result.payments.length})
          </Text>

          {result.payments.map((payment) => {
            const cardData = {
              affiliate_name: payment.affiliate_name,
              document: payment.document,
              base_salary: payment.net_salary / 0.96,
              employee_pension_deduction: (payment.net_salary / 0.96) * 0.04,
              net_salary: payment.net_salary,
              employer_pension_contrib: (payment.net_salary / 0.96) * 0.12,
              quote_id: payment.quote_id,
              status: payment.status,
            };
            return (
              <PayrollEmployeeCard key={payment.payment_id} data={cardData} />
            );
          })}

          <TouchableOpacity style={styles.newPayrollButton} onPress={handleReset}>
            <Text style={styles.newPayrollButtonText}>Nueva nómina</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── Confirm ──────────────────────────────────────────────────────────────
  if (view === "confirm" && preview) {
    return (
      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setExecuteError(null);
              setView("preview");
            }}
          >
            <Text style={styles.backButtonText}>← Volver a vista previa</Text>
          </TouchableOpacity>

          <Text style={styles.previewTitle}>Confirmar ejecución</Text>
          <Text style={styles.previewSubtitle}>
            {periodLabel} · {preview.company_name}
          </Text>

          <View style={styles.confirmCard}>
            <Text style={styles.confirmQuestion}>
              ¿Confirmas la ejecución de la nómina para{" "}
              <Text style={styles.confirmPeriodBold}>{periodLabel}</Text>?
            </Text>
            <Text style={styles.confirmWarning}>
              Esta acción debitará los fondos y registrará los pagos de{" "}
              {preview.totals.total_employees} empleado
              {preview.totals.total_employees !== 1 ? "s" : ""}. No se puede
              deshacer.
            </Text>

            <View style={styles.divider} />

            <View style={styles.totalsGrid}>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total a pagar (neto)</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(preview.totals.total_net_salary)}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total pensión</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(preview.totals.total_pension_contrib)}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total a debitar</Text>
                <Text style={[styles.totalValue, styles.totalDebit]}>
                  {formatCurrency(preview.totals.total_debit)}
                </Text>
              </View>
            </View>
          </View>

          {executeError && (
            <View style={styles.errorCard}>
              <Text style={styles.errorCardText}>{executeError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.executeButton,
              executeLoading && styles.executeButtonDisabled,
            ]}
            onPress={handleExecute}
            disabled={executeLoading}
          >
            {executeLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.executeButtonText}>Confirmar y ejecutar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setExecuteError(null);
              setView("preview");
            }}
            disabled={executeLoading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── Preview ──────────────────────────────────────────────────────────────
  if (view === "preview" && preview) {
    return (
      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setView("selector")}
          >
            <Text style={styles.backButtonText}>← Cambiar período</Text>
          </TouchableOpacity>

          <Text style={styles.previewTitle}>{periodLabel}</Text>
          <Text style={styles.previewSubtitle}>{preview.company_name}</Text>

          {/* Fund status */}
          <View
            style={[
              styles.fundCard,
              preview.fund_status.can_execute
                ? styles.fundCardOk
                : styles.fundCardWarn,
            ]}
          >
            <Text
              style={[
                styles.fundCardTitle,
                preview.fund_status.can_execute
                  ? styles.fundCardTitleOk
                  : styles.fundCardTitleWarn,
              ]}
            >
              {preview.fund_status.can_execute
                ? "✓  Fondos disponibles"
                : "⚠  Fondos insuficientes"}
            </Text>
            <View style={styles.fundRow}>
              <View style={styles.fundItem}>
                <Text style={styles.fundLabel}>Fondo nómina</Text>
                <Text
                  style={[
                    styles.fundValue,
                    !preview.fund_status.payroll_fund_sufficient &&
                      styles.fundValueInsufficient,
                  ]}
                >
                  {preview.fund_status.payroll_fund_sufficient ? "✓ " : "✗ "}
                  {formatCurrency(preview.payroll_fund_balance)}
                </Text>
              </View>
              <View style={[styles.fundItem, styles.fundItemRight]}>
                <Text style={styles.fundLabel}>Fondo pensión</Text>
                <Text
                  style={[
                    styles.fundValue,
                    !preview.fund_status.pension_fund_sufficient &&
                      styles.fundValueInsufficient,
                  ]}
                >
                  {preview.fund_status.pension_fund_sufficient ? "✓ " : "✗ "}
                  {formatCurrency(preview.pension_fund_balance)}
                </Text>
              </View>
            </View>
          </View>

          {/* Totals */}
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.card}>
            <View style={styles.totalsGrid}>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Empleados</Text>
                <Text style={styles.totalValue}>
                  {preview.totals.total_employees}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total neto</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(preview.totals.total_net_salary)}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total pensión</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(preview.totals.total_pension_contrib)}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total débito</Text>
                <Text style={[styles.totalValue, styles.totalDebit]}>
                  {formatCurrency(preview.totals.total_debit)}
                </Text>
              </View>
            </View>
          </View>

          {/* Employee list */}
          <Text style={styles.sectionTitle}>
            Empleados ({preview.employees.length})
          </Text>

          {preview.employees.map((emp) => (
            <PayrollEmployeeCard key={emp.contract_id} data={emp} />
          ))}

          {preview.fund_status.can_execute && (
            <TouchableOpacity
              style={styles.executeButton}
              onPress={() => setView("confirm")}
            >
              <Text style={styles.executeButtonText}>Ejecutar nómina →</Text>
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── Selector ─────────────────────────────────────────────────────────────
  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nómina</Text>
        <Text style={styles.subtitle}>
          Selecciona el período a previsualizar
        </Text>

        <Text style={styles.sectionTitle}>Año</Text>
        <View style={styles.chipsRow}>
          {YEARS.map((year) => (
            <TouchableOpacity
              key={year}
              style={[styles.chip, selectedYear === year && styles.chipActive]}
              onPress={() => setSelectedYear(year)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedYear === year && styles.chipTextActive,
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
                  selectedMonth === month.value && styles.chipActive,
                  isProcessed && styles.chipDisabled,
                ]}
                onPress={() => !isProcessed && setSelectedMonth(month.value)}
                disabled={isProcessed}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedMonth === month.value && styles.chipTextActive,
                    isProcessed && styles.chipTextDisabled,
                  ]}
                >
                  {month.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {previewError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorCardText}>{previewError}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.previewButton,
            previewLoading && styles.previewButtonDisabled,
          ]}
          onPress={handlePreview}
          disabled={previewLoading}
        >
          {previewLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.previewButtonText}>Previsualizar nómina</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/(tabs)/(employer)/payroll/history" as any)}
        >
          <Text style={styles.historyButtonText}>Ver historial de nóminas</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // ── Common ─────────────────────────────────────────────────────────────────
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  bottomSpacing: { height: 40 },

  // ── Chips ──────────────────────────────────────────────────────────────────
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#369BC9",
  },
  chipText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#369BC9",
    fontWeight: "600",
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  monthChip: {
    flexBasis: "22%",
    flexGrow: 1,
    maxWidth: "25%",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },

  // ── Error ──────────────────────────────────────────────────────────────────
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 12,
    marginBottom: 12,
  },
  errorCardText: {
    fontSize: 13,
    color: "#EF4444",
    textAlign: "center",
  },

  // ── Buttons ────────────────────────────────────────────────────────────────
  previewButton: {
    backgroundColor: "#369BC9",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  previewButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  previewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  executeButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  executeButtonDisabled: {
    backgroundColor: "#86EFAC",
  },
  executeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  newPayrollButton: {
    backgroundColor: "#369BC9",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  newPayrollButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // ── Preview / Confirm header ───────────────────────────────────────────────
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: "#369BC9",
    fontWeight: "500",
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  previewSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },

  // ── Fund status card ───────────────────────────────────────────────────────
  fundCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  fundCardOk: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  fundCardWarn: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
  },
  fundCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  fundCardTitleOk: { color: "#15803D" },
  fundCardTitleWarn: { color: "#C2410C" },
  fundRow: {
    flexDirection: "row",
  },
  fundItem: { flex: 1 },
  fundItemRight: { alignItems: "flex-end" },
  fundLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  fundValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  fundValueInsufficient: { color: "#EF4444" },

  // ── Totals ─────────────────────────────────────────────────────────────────
  totalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  totalItem: {
    width: "45%",
  },
  totalLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  totalDebit: {
    color: "#369BC9",
  },

  // ── Employee cards ─────────────────────────────────────────────────────────
  empHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4EA351",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  empInfo: { flex: 1 },
  empName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  empPosition: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  empDocBox: { alignItems: "flex-end" },
  empDocLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  empDocValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  empRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  empRowItem: { alignItems: "center" },
  empRowLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  empRowValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  deductionText: { color: "#EF4444" },
  netText: { color: "#16A34A" },
  empContrib: {
    flexDirection: "row",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexWrap: "wrap",
  },
  empContribLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  empContribValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },

  // ── Status badge ───────────────────────────────────────────────────────────
  statusBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#065F46",
  },

  // ── Confirm card ───────────────────────────────────────────────────────────
  confirmCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmQuestion: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 8,
    lineHeight: 22,
  },
  confirmPeriodBold: {
    fontWeight: "700",
  },
  confirmWarning: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 4,
  },

  // ── Result header ──────────────────────────────────────────────────────────
  successHeader: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 8,
  },
  successIcon: {
    fontSize: 48,
    color: "#16A34A",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#15803D",
    marginBottom: 4,
  },
  successPeriod: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  successCompany: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  // ── Remaining balances ─────────────────────────────────────────────────────
  remainingCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  remainingTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#15803D",
    marginBottom: 12,
  },
  historyButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#369BC9",
  },
  historyButtonText: {
    color: "#369BC9",
    fontSize: 16,
    fontWeight: "600",
  },
  chipDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    opacity: 0.4,
  },
  chipTextDisabled: {
    color: "#9CA3AF",
  },
});
