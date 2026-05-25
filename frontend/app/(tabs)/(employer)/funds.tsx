import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
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
import { getFunds } from "@/src/services/api/fundService";
import { useAuthContext } from "@/src/context/AuthContext";
import type { FundDto, FundType } from "@/src/dtos/fund/fund.dto";

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

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Sin actualizaciones";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "Fecha no válida";

  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FundCard({
  fund,
  onRecharge,
}: {
  fund: FundDto;
  onRecharge: (fund: FundDto) => void;
}) {
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
          <Ionicons
            name="add-circle-outline"
            size={16}
            color={isLow ? "#FFFFFF" : "#369BC9"}
          />
          <Text style={[styles.rechargeBtnText, isLow && styles.rechargeBtnTextUrgent]}>
            Recargar
          </Text>
        </TouchableOpacity>
      </View>

      {isLow && (
        <View style={styles.lowBanner}>
          <Ionicons name="warning-outline" size={14} color="#B45309" />
          <Text style={styles.lowBannerText}>
            Saldo bajo — recarga antes de ejecutar nómina
          </Text>
        </View>
      )}

      <Text style={styles.fundCardUpdated}>
        Actualizado: {formatDate(fund.updatedAt)}
      </Text>
    </View>
  );
}

export default function EmployerFundsScreen() {
  const { state } = useAuthContext();
  const user = state.user;
  const employerId = user?.user_id ?? "";

  const [funds, setFunds] = useState<FundDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el Modal de recarga
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFund, setSelectedFund] = useState<FundDto | null>(null);

  const fetchFunds = useCallback(async () => {
    if (!employerId) return;
    try {
      setError(null);
      const data = await getFunds(employerId);
      setFunds(data);
    } catch {
      setError("No se pudieron cargar los fondos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employerId]);

  useFocusEffect(
    useCallback(() => {
      fetchFunds();
    }, [fetchFunds])
  );

  function handleRefresh() {
    setRefreshing(true);
    fetchFunds();
  }

  function handleRecharge(fund: FundDto) {
    setSelectedFund(fund);
    setModalVisible(true);
  }

  function handleRechargeSuccess(updatedFund: FundDto) {
    // Actualizamos solo el fondo que se recargó para reflejar el nuevo saldo inmediatamente
    setFunds((prev) =>
      prev.map((f) => (f.type === updatedFund.type ? updatedFund : f))
    );
    Alert.alert(
      "¡Recarga exitosa! :))", 
      "El saldo del fondo se ha actualizado correctamente."
    );
  }

  if (!employerId) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#369BC9" />
          <Text style={styles.loadingText}>Cargando sesión...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (loading && funds.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#369BC9" />
          <Text style={styles.loadingText}>Cargando fondos...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error && funds.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#369BC9"]}
            tintColor="#369BC9"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Fondos</Text>
          <Text style={styles.subtitle}>Gestión de fondos empresariales</Text>
        </View>

        {funds.map((fund) => (
          <FundCard key={fund.type} fund={fund} onRecharge={handleRecharge} />
        ))}
      </ScrollView>

      {/* Renderizado del Modal */}
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

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 20 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, color: "#6B7280" },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryBtn: {
    backgroundColor: "#369BC9",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  fundCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  fundCardLow: {
    borderColor: "#FCD34D",
    backgroundColor: "#FFFBEB",
  },
  fundCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fundCardLabel: { fontSize: 13, color: "#6B7280", marginBottom: 4 },
  fundCardBalance: { fontSize: 22, fontWeight: "700", color: "#111827" },
  fundCardBalanceLow: { color: "#B45309" },
  fundCardUpdated: { fontSize: 11, color: "#9CA3AF", marginTop: 6 },
  rechargeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#F0F9FF",
  },
  rechargeBtnUrgent: {
    backgroundColor: "#F59E0B",
    borderColor: "#F59E0B",
  },
  rechargeBtnText: { fontSize: 13, color: "#369BC9", fontWeight: "600" },
  rechargeBtnTextUrgent: { color: "#FFFFFF" },
  lowBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
  },
  lowBannerText: { fontSize: 12, color: "#B45309", flex: 1 },
});