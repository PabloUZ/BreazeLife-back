import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import RechargeFundModal from "@/src/components/fund/RechargeFundModal";
import DateRangeFilter from "@/src/components/fund/DateRangeFilter"; // <-- Nuestro nuevo componente
import { getFunds, getFundMovements } from "@/src/services/api/fundService";
import { useAuthContext } from "@/src/context/AuthContext";
import type { FundDto, FundType, MovementDto } from "@/src/dtos/fund/fund.dto";

const PAGE_SIZE = 20;
type FundFilter = FundType | "ALL";

const FUND_FILTERS: { label: string; value: FundFilter }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Nómina", value: "PAYROLL" },
  { label: "Aportes", value: "PENSION" },
];

const FUND_LABELS: Record<FundType, string> = {
  PAYROLL: "Fondo de nómina",
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
    <View style={[styles.fundCard, isLow && styles.fundCardLow]}>
      <View style={styles.fundCardHeader}>
        <View>
          <Text style={styles.fundCardLabel}>{FUND_LABELS[fund.type]}</Text>
          <Text style={[styles.fundCardBalance, isLow && styles.fundCardBalanceLow]}>
            {formatCOP(fund.balance)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.rechargeBtn, isLow && styles.rechargeBtnUrgent]}
          onPress={() => onRecharge(fund)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={16} color={isLow ? "#FFFFFF" : "#369BC9"} />
          <Text style={[styles.rechargeBtnText, isLow && styles.rechargeBtnTextUrgent]}>
            Recargar
          </Text>
        </TouchableOpacity>
      </View>
      {isLow && (
        <View style={styles.lowBanner}>
          <Ionicons name="warning-outline" size={14} color="#B45309" />
          <Text style={styles.lowBannerText}>Saldo bajo — recarga antes de ejecutar nómina</Text>
        </View>
      )}
      <Text style={styles.fundCardUpdated}>Actualizado: {formatDate(fund.updatedAt)}</Text>
    </View>
  );
}

function MovementItem({ item }: { item: MovementDto }) {
  const isIncome = item.type === "INCOME";
  return (
    <View style={styles.movementRow}>
      <View style={styles.movementLeft}>
        <View style={[styles.movementDot, isIncome ? styles.dotIncome : styles.dotOutcome]} />
        <View>
          <Text style={styles.movementType}>
            {isIncome ? "Recarga" : "Descuento"} · {FUND_LABELS[item.fundType]}
          </Text>
          <Text style={styles.movementDate}>{formatDate(item.date)}</Text>
        </View>
      </View>
      <Text style={[styles.movementAmount, isIncome ? styles.amountIncome : styles.amountOutcome]}>
        {isIncome ? "+" : "-"}{formatCOP(item.amount)}
      </Text>
    </View>
  );
}

export default function EmployerFundsScreen() {
  const { state } = useAuthContext();
  const employerId = state.user?.user_id ?? "";

  // Estados
  const [funds, setFunds] = useState<FundDto[]>([]);
  const [movements, setMovements] = useState<MovementDto[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FundFilter>("ALL");
  
  // Estados de fechas para el Date Picker
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>(() => new Date().toISOString().split("T")[0]);

  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Estados del modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFund, setSelectedFund] = useState<FundDto | null>(null);

  const fetchFunds = useCallback(async () => {
    if (!employerId) return;
    try {
      const data = await getFunds(employerId);
      setFunds(data);
    } catch {
      setError("No se pudieron cargar los fondos.");
    }
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
          setHasMore(payroll.movements.length === PAGE_SIZE || pension.movements.length === PAGE_SIZE);
        } else {
          const result = await getFundMovements(employerId, filter, queryParams);
          allMovements = result.movements;
          setHasMore(result.movements.length === PAGE_SIZE);
        }

        setMovements((prev) => (replace ? allMovements : [...prev, ...allMovements]));
        setCurrentPage(page);
      } catch {
        setError("No se pudo cargar el historial de movimientos.");
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
      fetchFunds();
      fetchMovements(1, selectedFilter, true, fromDate, toDate);
    }, [selectedFilter, fromDate, toDate, fetchFunds, fetchMovements])
  );

  function handleFilterChange(filter: FundFilter) {
    if (filter === selectedFilter) return;
    setSelectedFilter(filter);
  }

  // Se dispara cuando el DateRangeFilter hace aplicar o limpiar
  function handleDateApply(from?: string, to?: string) {
    setFromDate(from);
    setToDate(to);
    // El fetchMovements se dispara auto por el useFocusEffect gracias a las dependencias
  }

  function handleRecharge(fund: FundDto) {
    setSelectedFund(fund);
    setModalVisible(true);
  }

  function handleRechargeSuccess(updatedFund: FundDto) {
    setFunds((prev) => prev.map((f) => (f.type === updatedFund.type ? updatedFund : f)));
    fetchMovements(1, selectedFilter, true, fromDate, toDate);
    Alert.alert("¡Recarga exitosa! 🎉", "El saldo del fondo se ha actualizado correctamente.");
  }

  function handleRefresh() {
    setRefreshing(true);
    fetchFunds();
    fetchMovements(1, selectedFilter, true, fromDate, toDate);
  }

  function handleLoadMore() {
    if (loadingMore || !hasMore) return;
    fetchMovements(currentPage + 1, selectedFilter, false, fromDate, toDate);
  }

  if (!employerId || (loading && funds.length === 0)) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#369BC9" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const ListHeader = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Fondos</Text>
        <Text style={styles.subtitle}>Gestión de fondos empresariales</Text>
      </View>

      {funds.map((fund) => (
        <FundCard key={fund.type} fund={fund} onRecharge={handleRecharge} />
      ))}

      <Text style={styles.sectionLabel}>Historial de movimientos</Text>
      
      {/* Nuestro nuevo filtro de fechas */}
      <DateRangeFilter onApply={handleDateApply} />

      <View style={styles.filtersRow}>
        {FUND_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, selectedFilter === f.value && styles.filterChipActive]}
            onPress={() => handleFilterChange(f.value)}
          >
            <Text style={[styles.filterChipText, selectedFilter === f.value && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={movements}
        keyExtractor={(item) => item.movementId}
        renderItem={({ item }) => <MovementItem item={item} />}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#369BC9"]} tintColor="#369BC9" />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Sin movimientos</Text>
              <Text style={styles.emptySubtitle}>
                Ajusta los filtros o realiza una recarga para ver actividad aquí.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#369BC9" style={styles.footerLoader} /> : null}
      />

      <RechargeFundModal
        visible={modalVisible}
        employerId={employerId}
        fund={selectedFund}
        onClose={() => setModalVisible(false)}
        onSuccess={handleRechargeSuccess}
      />
    </ScreenContainer>
  );
}

// Conserve tus estilos exactamente igual, no los modifiqué para mantener la coherencia
const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: "#6B7280" },
  errorText: { fontSize: 14, color: "#EF4444", textAlign: "center", paddingHorizontal: 24 },
  retryBtn: { backgroundColor: "#369BC9", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  fundCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  fundCardLow: { borderColor: "#FCD34D", backgroundColor: "#FFFBEB" },
  fundCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  fundCardLabel: { fontSize: 13, color: "#6B7280", marginBottom: 4 },
  fundCardBalance: { fontSize: 22, fontWeight: "700", color: "#111827" },
  fundCardBalanceLow: { color: "#B45309" },
  fundCardUpdated: { fontSize: 11, color: "#9CA3AF", marginTop: 6 },
  rechargeBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#BAE6FD", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: "#F0F9FF" },
  rechargeBtnUrgent: { backgroundColor: "#F59E0B", borderColor: "#F59E0B" },
  rechargeBtnText: { fontSize: 13, color: "#369BC9", fontWeight: "600" },
  rechargeBtnTextUrgent: { color: "#FFFFFF" },
  lowBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FEF3C7", borderRadius: 6, padding: 8, marginBottom: 4 },
  lowBannerText: { fontSize: 12, color: "#B45309", flex: 1 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 10, marginTop: 4 },
  filtersRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
  filterChipActive: { backgroundColor: "#EFF6FF", borderColor: "#369BC9" },
  filterChipText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  filterChipTextActive: { color: "#369BC9", fontWeight: "600" },
  movementRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F3F4F6" },
  movementLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  movementDot: { width: 10, height: 10, borderRadius: 5 },
  dotIncome: { backgroundColor: "#16A34A" },
  dotOutcome: { backgroundColor: "#EF4444" },
  movementType: { fontSize: 13, color: "#374151", fontWeight: "500" },
  movementDate: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  movementAmount: { fontSize: 14, fontWeight: "600" },
  amountIncome: { color: "#16A34A" },
  amountOutcome: { color: "#EF4444" },
  emptyContainer: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#374151" },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingHorizontal: 32, lineHeight: 20 },
  footerLoader: { paddingVertical: 16 },
});