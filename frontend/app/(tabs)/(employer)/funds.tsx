import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppEmptyState from "@/src/components/common/AppEmptyState";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import RechargeFundModal from "@/src/components/fund/RechargeFundModal";
import DateRangeFilter from "@/src/components/fund/DateRangeFilter";
import EmployerScreenContainer from "@/src/components/layout/EmployerScreenContainer";
import { useAuthContext } from "@/src/context/AuthContext";
import type { FundDto, FundType, MovementDto } from "@/src/dtos/fund/fund.dto";
import { getFunds, getFundMovements } from "@/src/services/api/fundService";
import { colors, formStyles, spacing, typography } from "@/src/theme";

const PAGE_SIZE = 20;
type FundFilter = FundType | "ALL";

const FUND_FILTERS: { label: string; value: FundFilter }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Nomina", value: "PAYROLL" },
  { label: "Aportes", value: "PENSION" },
];

const FUND_LABELS: Record<FundType, string> = {
  PAYROLL: "Fondo de nomina",
  PENSION: "Fondo de aportes",
};

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso?: string | null): string {
  if (!iso) return "No disponible";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FundCard({ fund, onRecharge }: { fund: FundDto; onRecharge: (f: FundDto) => void }) {
  const isLow = fund.balance < 500_000;

  return (
    <AppCard variant={isLow ? "muted" : "default"} style={styles.fundCard}>
      <View style={styles.fundCardHeader}>
        <View style={styles.fundCopy}>
          <Text style={styles.fundCardLabel}>{FUND_LABELS[fund.type]}</Text>
          <Text style={[styles.fundCardBalance, isLow ? styles.fundCardBalanceLow : null]}>
            {formatCOP(fund.balance)}
          </Text>
          <Text style={styles.fundCardUpdated}>Actualizado: {formatDate(fund.updatedAt)}</Text>
        </View>

        <AppButton
          title="Recargar"
          variant={isLow ? "primary" : "secondary"}
          iconName="add-circle-outline"
          onPress={() => onRecharge(fund)}
        />
      </View>

      {isLow ? (
        <View style={styles.lowBanner}>
          <Ionicons name="warning-outline" size={14} color={colors.warningText} />
          <Text style={styles.lowBannerText}>
            Saldo bajo. Recarga antes de ejecutar nomina.
          </Text>
        </View>
      ) : null}
    </AppCard>
  );
}

function MovementItem({ item }: { item: MovementDto }) {
  const isIncome = item.type === "INCOME";

  return (
    <AppCard compact style={styles.movementCard}>
      <View style={styles.movementRow}>
        <View style={styles.movementLeft}>
          <View style={[styles.movementDot, isIncome ? styles.dotIncome : styles.dotOutcome]} />
          <View style={styles.movementCopy}>
            <Text style={styles.movementType}>
              {isIncome ? "Recarga" : "Descuento"} · {FUND_LABELS[item.fundType]}
            </Text>
            <Text style={styles.movementDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <Text style={[styles.movementAmount, isIncome ? styles.amountIncome : styles.amountOutcome]}>
          {isIncome ? "+" : "-"}
          {formatCOP(item.amount)}
        </Text>
      </View>
    </AppCard>
  );
}

export default function EmployerFundsScreen() {
  const { state } = useAuthContext();
  const employerId = state.user?.user_id ?? "";

  const [funds, setFunds] = useState<FundDto[]>([]);
  const [movements, setMovements] = useState<MovementDto[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FundFilter>("ALL");
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFund, setSelectedFund] = useState<FundDto | null>(null);

  const fetchFunds = useCallback(async () => {
    if (!employerId) return;
    const data = await getFunds(employerId);
    setFunds(data);
  }, [employerId]);

  const fetchMovements = useCallback(
    async (page: number, filter: FundFilter, replace: boolean, from?: string, to?: string) => {
      if (!employerId) return;

      try {
        if (replace) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        let allMovements: MovementDto[] = [];
        const queryParams = { page, limit: PAGE_SIZE, from, to };

        if (filter === "ALL") {
          const [payroll, pension] = await Promise.all([
            getFundMovements(employerId, "PAYROLL", queryParams),
            getFundMovements(employerId, "PENSION", queryParams),
          ]);
          allMovements = [...payroll.movements, ...pension.movements].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setHasMore(
            payroll.movements.length === PAGE_SIZE ||
              pension.movements.length === PAGE_SIZE
          );
        } else {
          const result = await getFundMovements(employerId, filter, queryParams);
          allMovements = result.movements;
          setHasMore(result.movements.length === PAGE_SIZE);
        }

        setMovements((prev) => (replace ? allMovements : [...prev, ...allMovements]));
        setCurrentPage(page);
      } catch {
        setError("No se pudo cargar la informacion de fondos.");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [employerId]
  );

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        fetchFunds().catch(() => setError("No se pudieron cargar los fondos.")),
        fetchMovements(1, selectedFilter, true, fromDate, toDate),
      ]);
    }, [selectedFilter, fromDate, toDate, fetchFunds, fetchMovements])
  );

  function handleDateApply(from?: string, to?: string) {
    setFromDate(from);
    setToDate(to);
  }

  function handleRecharge(fund: FundDto) {
    setSelectedFund(fund);
    setModalVisible(true);
  }

  function handleRechargeSuccess(updatedFund: FundDto) {
    setFunds((prev) => prev.map((fund) => (fund.type === updatedFund.type ? updatedFund : fund)));
    fetchMovements(1, selectedFilter, true, fromDate, toDate);
    Alert.alert("Recarga exitosa", "El saldo del fondo se actualizo correctamente.");
  }

  function handleRefresh() {
    setRefreshing(true);
    fetchFunds().catch(() => setError("No se pudieron cargar los fondos."));
    fetchMovements(1, selectedFilter, true, fromDate, toDate);
  }

  function handleLoadMore() {
    if (loadingMore || !hasMore) return;
    fetchMovements(currentPage + 1, selectedFilter, false, fromDate, toDate);
  }

  if (!employerId || (loading && funds.length === 0)) {
    return (
      <EmployerScreenContainer>
        <AppLoadingState message="Cargando fondos..." />
      </EmployerScreenContainer>
    );
  }

  if (error && funds.length === 0 && movements.length === 0) {
    return (
      <EmployerScreenContainer>
        <AppErrorState message={error} onRetry={handleRefresh} />
      </EmployerScreenContainer>
    );
  }

  return (
    <EmployerScreenContainer>
      <FlatList
        data={movements}
        keyExtractor={(item) => item.movementId}
        renderItem={({ item }) => <MovementItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <AppHeader
              title="Fondos"
              subtitle="Administra los fondos empresariales y revisa los movimientos recientes."
            />

            {funds.map((fund) => (
              <FundCard key={fund.type} fund={fund} onRecharge={handleRecharge} />
            ))}

            <Text style={styles.sectionLabel}>Historial de movimientos</Text>
            <DateRangeFilter onApply={handleDateApply} />

            <View style={styles.filtersRow}>
              {FUND_FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter.value}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter.value ? styles.filterChipActive : null,
                  ]}
                  onPress={() => setSelectedFilter(filter.value)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedFilter === filter.value ? styles.filterChipTextActive : null,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <AppEmptyState
              title="Sin movimientos"
              description="Ajusta los filtros o realiza una recarga para ver actividad aqui."
            />
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.footerLoader} />
          ) : null
        }
      />

      <RechargeFundModal
        visible={modalVisible}
        employerId={employerId}
        fund={selectedFund}
        onClose={() => setModalVisible(false)}
        onSuccess={handleRechargeSuccess}
      />
    </EmployerScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  headerContent: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  fundCard: {
    marginBottom: spacing.xs,
  },
  fundCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  fundCopy: {
    flex: 1,
    minWidth: 0,
  },
  fundCardLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  fundCardBalance: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  fundCardBalanceLow: {
    color: colors.warningText,
  },
  fundCardUpdated: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: spacing.sm,
  },
  lowBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderRadius: 10,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  lowBannerText: {
    ...typography.caption,
    color: colors.warningText,
    flex: 1,
  },
  sectionLabel: {
    ...typography.bodyStrong,
    color: colors.neutralText,
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterChip: formStyles.chip,
  filterChipActive: formStyles.chipActive,
  filterChipText: formStyles.chipText,
  filterChipTextActive: formStyles.chipTextActive,
  movementCard: {
    marginBottom: spacing.sm,
  },
  movementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  movementLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  movementCopy: {
    flex: 1,
    minWidth: 0,
  },
  movementDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  dotIncome: {
    backgroundColor: colors.success,
  },
  dotOutcome: {
    backgroundColor: colors.danger,
  },
  movementType: {
    ...typography.bodyStrong,
    color: colors.neutralText,
  },
  movementDate: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: 2,
  },
  movementAmount: {
    ...typography.bodyStrong,
    flexShrink: 1,
    textAlign: "right",
  },
  amountIncome: {
    color: colors.successText,
  },
  amountOutcome: {
    color: colors.dangerText,
  },
  footerLoader: {
    paddingVertical: spacing.md,
  },
});
