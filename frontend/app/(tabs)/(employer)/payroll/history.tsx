import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppEmptyState from "@/src/components/common/AppEmptyState";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import EmployerScreenContainer from "@/src/components/layout/EmployerScreenContainer";
import type { PayrollHistoryItemDto } from "@/src/dtos/employer/employer.dtos";
import { getPayrollHistory } from "@/src/services/api/payrollService";
import { formatCurrency, formatPeriod, formatDate } from "@/src/utils/formatters";
import { formStyles, spacing, typography } from "@/src/theme";

const MONTHS = [
  { label: "Todos", value: null },
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
const YEARS = [null, CURRENT_YEAR - 1, CURRENT_YEAR];

const STATUSES = [
  { label: "Todos", value: null },
  { label: "Procesada", value: "PROCESSED" },
  { label: "Pendiente", value: "PENDING" },
];

export default function EmployerPayrollHistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<PayrollHistoryItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const fetchHistory = async (currentPage: number) => {
    try {
      setLoading(true);
      setError(null);

      let periodParam: string | undefined;
      if (selectedYear) {
        const monthPart = selectedMonth ? String(selectedMonth).padStart(2, "0") : "";
        periodParam = monthPart ? `${selectedYear}-${monthPart}` : `${selectedYear}`;
      }

      const res = await getPayrollHistory({
        page: currentPage,
        limit: 10,
        period: periodParam,
        status: selectedStatus || undefined,
      });

      setItems(res.data.items || []);
      setPage(res.data.pagination.page);
      setTotalPages(res.data.pagination.total_pages);
      setTotalItems(res.data.pagination.total_items);
    } catch {
      setError("No se pudo cargar el historial. Revisa tu conexion.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory(page);
    }, [page, selectedYear, selectedMonth, selectedStatus])
  );

  const handleFilterChange = (type: "year" | "month" | "status", value: any) => {
    setPage(1);
    if (type === "year") {
      setSelectedYear(value);
      if (!value) setSelectedMonth(null);
    } else if (type === "month") {
      setSelectedMonth(value);
    } else {
      setSelectedStatus(value);
    }
  };

  if (loading) {
    return (
      <EmployerScreenContainer>
        <AppLoadingState message="Buscando nominas..." />
      </EmployerScreenContainer>
    );
  }

  if (error) {
    return (
      <EmployerScreenContainer>
        <AppErrorState message={error} onRetry={() => fetchHistory(page)} />
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
          title="Historial de nominas"
          subtitle="Filtra periodos procesados y revisa el detalle de cada ejecucion."
        />

        <AppCard>
          <Text style={styles.filterTitle}>Ano</Text>
          <View style={styles.chipsRow}>
            {YEARS.map((year) => (
              <TouchableOpacity
                key={year === null ? "all-years" : year}
                style={[styles.chip, selectedYear === year ? styles.chipActive : null]}
                onPress={() => handleFilterChange("year", year)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedYear === year ? styles.chipTextActive : null,
                  ]}
                >
                  {year === null ? "Todos" : year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedYear ? (
            <>
              <Text style={styles.filterTitle}>Mes</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.scrollChipsRow}>
                  {MONTHS.map((month) => (
                    <TouchableOpacity
                      key={month.value === null ? "all-months" : month.value}
                      style={[styles.chip, selectedMonth === month.value ? styles.chipActive : null]}
                      onPress={() => handleFilterChange("month", month.value)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedMonth === month.value ? styles.chipTextActive : null,
                        ]}
                      >
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </>
          ) : null}

          <Text style={styles.filterTitle}>Estado</Text>
          <View style={styles.chipsRow}>
            {STATUSES.map((status) => (
              <TouchableOpacity
                key={status.value === null ? "all-status" : status.value}
                style={[styles.chip, selectedStatus === status.value ? styles.chipActive : null]}
                onPress={() => handleFilterChange("status", status.value)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedStatus === status.value ? styles.chipTextActive : null,
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </AppCard>

        <Text style={styles.resultsCount}>
          {totalItems} {totalItems === 1 ? "nomina encontrada" : "nominas encontradas"}
        </Text>

        {items.length === 0 ? (
          <AppEmptyState
            title="Sin nominas"
            description="No se encontraron nominas ejecutadas con los filtros seleccionados."
          />
        ) : (
          <>
            {items.map((item) => (
              <TouchableOpacity
                key={item.payroll_id}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/(employer)/payroll/detail",
                    params: { payrollId: item.payroll_id },
                  } as any)
                }
                activeOpacity={0.82}
              >
                <AppCard style={styles.payrollCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.headerCopy}>
                      <Text style={styles.cardPeriod}>{formatPeriod(item.period)}</Text>
                      <Text style={styles.cardDate}>Ejecutado: {formatDate(item.executed_at)}</Text>
                    </View>
                    <AppStatusBadge
                      label={item.status === "PROCESSED" ? "Procesada" : item.status}
                      tone={item.status === "PROCESSED" ? "success" : "warning"}
                    />
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Empleados</Text>
                      <Text style={styles.detailValue}>{item.total_employees}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Total neto</Text>
                      <Text style={styles.detailValue}>{formatCurrency(item.total_net_salary)}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Total debitado</Text>
                      <Text style={[styles.detailValue, styles.primaryText]}>
                        {formatCurrency(item.total_debit)}
                      </Text>
                    </View>
                  </View>
                </AppCard>
              </TouchableOpacity>
            ))}

            {totalPages > 1 ? (
              <View style={styles.paginationRow}>
                <AppButton
                  title="Anterior"
                  variant="secondary"
                  onPress={() => page > 1 && setPage(page - 1)}
                  disabled={page === 1}
                />
                <Text style={styles.pageIndicator}>
                  Pagina {page} de {totalPages}
                </Text>
                <AppButton
                  title="Siguiente"
                  variant="secondary"
                  onPress={() => page < totalPages && setPage(page + 1)}
                  disabled={page === totalPages}
                />
              </View>
            ) : null}
          </>
        )}
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
  filterTitle: {
    ...typography.bodyStrong,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  scrollChipsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: formStyles.chip,
  chipActive: formStyles.chipActive,
  chipText: formStyles.chipText,
  chipTextActive: formStyles.chipTextActive,
  resultsCount: {
    ...typography.body,
  },
  payrollCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  cardPeriod: {
    ...typography.cardTitle,
  },
  cardDate: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5EEF5",
    marginVertical: spacing.md,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  detailCol: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 96,
  },
  detailLabel: {
    ...typography.caption,
    color: "#9CA3AF",
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.bodyStrong,
  },
  primaryText: {
    color: "#369BC9",
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  pageIndicator: {
    ...typography.caption,
    flex: 1,
    textAlign: "center",
  },
});
