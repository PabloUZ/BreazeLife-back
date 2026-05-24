import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import DashboardMetricCard from "@/src/components/admin/DashboardMetricCard";
import { useAdminModule } from "@/src/hooks/useAdminModule";

function formatCurrency(amount: number): string {
  return `$${new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

function formatCompactMetricValue(amount: number): string {
  const absoluteAmount = Math.abs(amount);
  const units = [
    { divisor: 1_000_000_000, suffix: "B" },
    { divisor: 1_000_000, suffix: "M" },
    { divisor: 1_000, suffix: "K" },
  ];

  for (const unit of units) {
    if (absoluteAmount >= unit.divisor) {
      const scaledAmount = amount / unit.divisor;

      return `${new Intl.NumberFormat("es-CO", {
        maximumFractionDigits: Number.isInteger(scaledAmount) ? 0 : 1,
      }).format(scaledAmount)}${unit.suffix}`;
    }
  }

  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const { error, isEmpty, isLoading, isRefreshing, refresh, summary } =
    useAdminModule();
  const horizontalPadding = 40;
  const gridGap = 12;
  const metricCardWidth = Math.max((width - horizontalPadding - gridGap) / 2, 140);

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#369BC9" />
          <Text style={styles.loadingText}>Cargando resumen del dashboard...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Resumen general</Text>
          <Text style={styles.subtitle}>
            Consulta el estado actual de la plataforma desde la app movil.
          </Text>
        </View>

        {isEmpty && (
          <View style={styles.emptyBanner}>
            <Text style={styles.emptyBannerText}>
              Aun no hay movimientos para mostrar. Los indicadores apareceran en
              cero hasta que exista informacion registrada.
            </Text>
          </View>
        )}

        <View style={styles.metricsGrid}>
          <DashboardMetricCard
            cardWidth={metricCardWidth}
            label="Afiliados activos"
            value={summary.activeAffiliates.toString()}
            iconName="people-outline"
          />
          <DashboardMetricCard
            cardWidth={metricCardWidth}
            label="Empleadores activos"
            value={summary.activeEmployers.toString()}
            iconName="business-outline"
          />
          <DashboardMetricCard
            cardWidth={metricCardWidth}
            label="Aportes pendientes"
            value={summary.pendingContributions.toString()}
            iconName="time-outline"
          />
          <DashboardMetricCard
            cardWidth={metricCardWidth}
            label="Balance administrado"
            value={formatCompactMetricValue(summary.managedBalance)}
            helperText={formatCurrency(summary.managedBalance)}
            iconName="wallet-outline"
          />
          <DashboardMetricCard
            label="Aportes mensuales"
            value={formatCompactMetricValue(summary.monthlyContributions)}
            helperText={formatCurrency(summary.monthlyContributions)}
            iconName="cash-outline"
            fullWidth
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: "#369BC9",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    paddingBottom: 24,
    gap: 18,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  emptyBanner: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
  },
  emptyBannerText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginHorizontal: -4,
  },
});
