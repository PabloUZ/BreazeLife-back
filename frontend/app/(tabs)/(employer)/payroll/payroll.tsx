import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import { previewPayroll } from "@/src/services/api/payrollService";
import type { PayrollPreviewDataDto } from "@/src/dtos/employer/employer.dtos";

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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getMonthLabel(month: number): string {
  return MONTHS.find((m) => m.value === month)?.label ?? "";
}

export default function EmployerPayrollScreen() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PayrollPreviewDataDto | null>(null);

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const period = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
      const result = await previewPayroll({ period });
      setPreview(result.data);
    } catch (err) {
      const code = (err as any)?.response?.data?.message_code;
      if (code === "NO_ACTIVE_EMPLOYEES") {
        setError("No tienes empleados activos para este período.");
      } else if (code === "PAYROLL_ALREADY_PROCESSED") {
        setError("La nómina de este período ya fue procesada.");
      } else {
        setError("No se pudo generar la vista previa. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Preview results ──────────────────────────────────────────────────────
  if (preview) {
    return (
      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setPreview(null)}
          >
            <Text style={styles.backButtonText}>← Cambiar período</Text>
          </TouchableOpacity>

          <Text style={styles.previewTitle}>
            {getMonthLabel(selectedMonth)} {selectedYear}
          </Text>
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
            <View key={emp.contract_id} style={styles.card}>
              <View style={styles.empHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {emp.affiliate_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.empInfo}>
                  <Text style={styles.empName}>{emp.affiliate_name}</Text>
                  <Text style={styles.empPosition}>{emp.position}</Text>
                </View>
                <View style={styles.empDocBox}>
                  <Text style={styles.empDocLabel}>Cédula</Text>
                  <Text style={styles.empDocValue}>{emp.document}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.empRow}>
                <View style={styles.empRowItem}>
                  <Text style={styles.empRowLabel}>Salario base</Text>
                  <Text style={styles.empRowValue}>
                    {formatCurrency(emp.base_salary)}
                  </Text>
                </View>
                <View style={styles.empRowItem}>
                  <Text style={styles.empRowLabel}>Ded. pensión</Text>
                  <Text style={[styles.empRowValue, styles.deductionText]}>
                    - {formatCurrency(emp.employee_pension_deduction)}
                  </Text>
                </View>
                <View style={styles.empRowItem}>
                  <Text style={styles.empRowLabel}>Salario neto</Text>
                  <Text style={[styles.empRowValue, styles.netText]}>
                    {formatCurrency(emp.net_salary)}
                  </Text>
                </View>
              </View>

              <View style={styles.empContrib}>
                <Text style={styles.empContribLabel}>
                  Contribución empleador pensión:{" "}
                </Text>
                <Text style={styles.empContribValue}>
                  {formatCurrency(emp.employer_pension_contrib)}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── Period selector ──────────────────────────────────────────────────────
  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Vista previa de nómina</Text>
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
          {MONTHS.map((month) => (
            <TouchableOpacity
              key={month.value}
              style={[
                styles.monthChip,
                selectedMonth === month.value && styles.chipActive,
              ]}
              onPress={() => setSelectedMonth(month.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedMonth === month.value && styles.chipTextActive,
                ]}
              >
                {month.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorCardText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.previewButton,
            loading && styles.previewButtonDisabled,
          ]}
          onPress={handlePreview}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.previewButtonText}>Previsualizar nómina</Text>
          )}
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

  // ── Preview button ─────────────────────────────────────────────────────────
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

  // ── Preview header ─────────────────────────────────────────────────────────
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

  // ── Totals card ────────────────────────────────────────────────────────────
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
});
