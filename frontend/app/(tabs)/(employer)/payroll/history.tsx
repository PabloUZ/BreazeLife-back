import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import { getPayrollHistory } from "@/src/services/api/payrollService";
import type { PayrollHistoryItemDto } from "@/src/dtos/employer/employer.dtos";
import { formatCurrency, formatPeriod, formatDate } from "@/src/utils/formatters";

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

  // Estados de datos y paginación
  const [items, setItems] = useState<PayrollHistoryItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Estados de filtros
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const fetchHistory = async (currentPage: number) => {
    try {
      setLoading(true);
      setError(null);

      // Construir el filtro de periodo si se seleccionaron año y mes
      let periodParam: string | undefined;
      if (selectedYear) {
        const monthPart = selectedMonth
          ? String(selectedMonth).padStart(2, "0")
          : "";
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
    } catch (err) {
      setError("No se pudo cargar el historial. Revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  // Carga al entrar en foco o al cambiar los filtros / página
  useFocusEffect(
    useCallback(() => {
      fetchHistory(page);
    }, [page, selectedYear, selectedMonth, selectedStatus])
  );

  // Reiniciar a página 1 al cambiar cualquier filtro
  const handleFilterChange = (type: "year" | "month" | "status", value: any) => {
    setPage(1);
    if (type === "year") {
      setSelectedYear(value);
      // Si se deselecciona el año, también se deselecciona el mes
      if (!value) setSelectedMonth(null);
    } else if (type === "month") {
      setSelectedMonth(value);
    } else if (type === "status") {
      setSelectedStatus(value);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Historial de Nóminas",
          headerShown: true,
        }}
      />
      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          {/* Sección de Filtros */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Filtros de búsqueda</Text>

            {/* Año */}
            <Text style={styles.filterSubtitle}>Año</Text>
            <View style={styles.chipsRow}>
              {YEARS.map((year) => (
                <TouchableOpacity
                  key={year === null ? "all-years" : year}
                  style={[
                    styles.chip,
                    selectedYear === year && styles.chipActive,
                  ]}
                  onPress={() => handleFilterChange("year", year)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedYear === year && styles.chipTextActive,
                    ]}
                  >
                    {year === null ? "Todos" : year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Mes (solo habilitado si hay un año seleccionado) */}
            {selectedYear && (
              <>
                <Text style={styles.filterSubtitle}>Mes</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollChipsRow}
                >
                  {MONTHS.map((month) => (
                    <TouchableOpacity
                      key={month.value === null ? "all-months" : month.value}
                      style={[
                        styles.chip,
                        selectedMonth === month.value && styles.chipActive,
                      ]}
                      onPress={() => handleFilterChange("month", month.value)}
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
                </ScrollView>
              </>
            )}

            {/* Estado */}
            <Text style={styles.filterSubtitle}>Estado</Text>
            <View style={styles.chipsRow}>
              {STATUSES.map((status) => (
                <TouchableOpacity
                  key={status.value === null ? "all-status" : status.value}
                  style={[
                    styles.chip,
                    selectedStatus === status.value && styles.chipActive,
                  ]}
                  onPress={() => handleFilterChange("status", status.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedStatus === status.value && styles.chipTextActive,
                    ]}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Listado de Historial */}
          <View style={styles.listHeader}>
            <Text style={styles.resultsCount}>
              {totalItems} {totalItems === 1 ? "nómina encontrada" : "nóminas encontradas"}
            </Text>
          </View>

          {loading ? (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color="#369BC9" />
              <Text style={styles.stateText}>Buscando nóminas...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchHistory(page)}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No se encontraron nóminas ejecutadas con los filtros seleccionados.
              </Text>
            </View>
          ) : (
            <>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.payroll_id}
                  style={styles.payrollCard}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(employer)/payroll/detail",
                      params: { payrollId: item.payroll_id },
                    } as any)
                  }
                >
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardPeriod}>
                        {formatPeriod(item.period)}
                      </Text>
                      <Text style={styles.cardDate}>
                        Ejecutado: {formatDate(item.executed_at)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        item.status === "PROCESSED"
                          ? styles.badgeProcessed
                          : styles.badgePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          item.status === "PROCESSED"
                            ? styles.textProcessed
                            : styles.textPending,
                        ]}
                      >
                        {item.status === "PROCESSED" ? "Procesada" : item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardDetails}>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Empleados</Text>
                      <Text style={styles.detailValue}>{item.total_employees}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Total Neto</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(item.total_net_salary)}
                      </Text>
                    </View>
                    <View style={styles.detailColRight}>
                      <Text style={styles.detailLabel}>Total Debitado</Text>
                      <Text style={[styles.detailValue, styles.debitValue]}>
                        {formatCurrency(item.total_debit)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Controles de Paginación */}
              {totalPages > 1 && (
                <View style={styles.paginationRow}>
                  <TouchableOpacity
                    style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                    onPress={handlePrevPage}
                    disabled={page === 1}
                  >
                    <Text
                      style={[
                        styles.pageButtonText,
                        page === 1 && styles.pageButtonTextDisabled,
                      ]}
                    >
                      {"← Anterior"}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.pageIndicator}>
                    Página {page} de {totalPages}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.pageButton,
                      page === totalPages && styles.pageButtonDisabled,
                    ]}
                    onPress={handleNextPage}
                    disabled={page === totalPages}
                  >
                    <Text
                      style={[
                        styles.pageButtonText,
                        page === totalPages && styles.pageButtonTextDisabled,
                      ]}
                    >
                      {"Siguiente →"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 4,
  },
  filterSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  filterSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 8,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  scrollChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#369BC9",
  },
  chipText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#369BC9",
    fontWeight: "600",
  },
  listHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  resultsCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  payrollCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardPeriod: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeProcessed: {
    backgroundColor: "#D1FAE5",
  },
  badgePending: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  textProcessed: {
    color: "#065F46",
  },
  textPending: {
    color: "#92400E",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailCol: {
    flex: 1,
  },
  detailColRight: {
    flex: 1.2,
    alignItems: "flex-end",
  },
  detailLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  debitValue: {
    color: "#369BC9",
  },
  centeredState: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: "#6B7280",
  },
  errorState: {
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: "#369BC9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  pageButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  pageButtonDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  pageButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  pageButtonTextDisabled: {
    color: "#9CA3AF",
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
  },
  bottomSpacing: {
    height: 40,
  },
});
