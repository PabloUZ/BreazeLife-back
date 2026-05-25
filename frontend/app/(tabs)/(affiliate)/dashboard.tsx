import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useAuthContext } from "@/src/context/AuthContext";
import { getAffiliateDashboard } from "@/src/services/api/affiliateService";
import type { AffiliateDashboardDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { formatCurrency } from "@/src/utils/formatters";
import PensionProgressWidget from "@/src/components/affiliate/PensionProgressWidget";
import { RentabilityHistory } from "@/src/components/affiliate/RentabilityHistory";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CONSERVATIVE: "Conservador",
  MODERATE: "Moderado",
  RISKY: "Arriesgado",
};

function formatContribDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

export default function AffiliateDashboardScreen() {
  const { state } = useAuthContext();
  const [dashboard, setDashboard] = useState<AffiliateDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getAffiliateDashboard();
      setDashboard(data);
    } catch {
      setError("No se pudo cargar el dashboard. Verifica tu conexión.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#369BC9" />
        <Text style={styles.loadingText}>Cargando tu información...</Text>
      </View>
    );
  }

  if (error || !dashboard) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? "Error inesperado"}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor="#369BC9"
        />
      }
    >
      <Text style={styles.pageTitle}>Mi Dashboard</Text>
      <Text style={styles.welcomeText}>
        Hola, {state.user?.first_name}
      </Text>

      {/* Balance principal */}
      <View style={[styles.card, styles.cardAccent]}>
        <Text style={styles.cardLabelAccent}>Saldo acumulado</Text>
        <Text style={styles.balanceValue}>{formatCurrency(dashboard.balance)}</Text>
        <Text style={styles.cardSubAccent}>
          {ACCOUNT_TYPE_LABELS[dashboard.accountType] ?? dashboard.accountType} ·{" "}
          {dashboard.accountId}
        </Text>
      </View>

      {/* Semanas */}
      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardLabel}>Semanas cotizadas</Text>
          <Text style={styles.statValue}>{Math.floor(dashboard.quotedWeeks)}</Text>
          <Text style={styles.cardSub}>de 1.300</Text>
        </View>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardLabel}>Semanas restantes</Text>
          <Text style={styles.statValue}>{Math.floor(dashboard.weeksRemaining)}</Text>
        </View>
      </View>

      {/* Widget de progreso (BLIFE-14) */}
      <PensionProgressWidget
        data={{
          accumulatedWeeks: dashboard.quotedWeeks,
          missingWeeks: dashboard.weeksRemaining,
          progressPercentage: dashboard.progressPercentage,
        }}
      />

      {/* Rentabilidad mensual */}
      {dashboard.monthlyProfitability && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Rentabilidad del mes</Text>
          <Text style={styles.statValue}>
            {formatCurrency(dashboard.monthlyProfitability.profit)}
          </Text>
          <Text style={styles.cardSub}>{dashboard.monthlyProfitability.date}</Text>
        </View>
      )}

      {/* Último aporte */}
      {dashboard.lastContribution && (
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardLabel}>Último aporte</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {dashboard.lastContribution.status}
              </Text>
            </View>
          </View>
          <Text style={styles.statValue}>
            {formatCurrency(dashboard.lastContribution.totalContribution)}
          </Text>
          <Text style={styles.cardSub}>
            {formatContribDate(dashboard.lastContribution.contribDate)}
          </Text>
          <View style={styles.divider} />
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Empleador</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(dashboard.lastContribution.employerContrib)}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Afiliado</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(dashboard.lastContribution.affiliateContrib)}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Días</Text>
              <Text style={styles.breakdownValue}>
                {dashboard.lastContribution.daysContributed}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Historial de rentabilidad */}
      <RentabilityHistory />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 20, paddingTop: 32, gap: 12 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: { marginTop: 12, color: "#6B7280", fontSize: 16 },
  errorText: { color: "#DC2626", textAlign: "center", padding: 24, fontSize: 15 },
  pageTitle: { fontSize: 26, fontWeight: "700", color: "#111827", marginBottom: 2 },
  welcomeText: { fontSize: 15, color: "#6B7280", marginBottom: 8 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardAccent: { backgroundColor: "#369BC9" },
  halfCard: { flex: 1 },
  row: { flexDirection: "row", gap: 12 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardLabel: { fontSize: 13, color: "#6B7280", fontWeight: "500", marginBottom: 6 },
  cardLabelAccent: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "500", marginBottom: 6 },
  cardSub: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  cardSubAccent: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  balanceValue: { fontSize: 28, fontWeight: "700", color: "#FFFFFF" },
  statValue: { fontSize: 22, fontWeight: "700", color: "#111827" },
  statusBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: { fontSize: 12, fontWeight: "600", color: "#059669" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 10 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between" },
  breakdownItem: { flex: 1, alignItems: "center" },
  breakdownLabel: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  breakdownValue: { fontSize: 13, fontWeight: "600", color: "#111827" },
});