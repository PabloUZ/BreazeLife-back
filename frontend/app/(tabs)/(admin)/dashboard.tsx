import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import DashboardMetricCard from "@/src/components/admin/DashboardMetricCard";
import { useAdminModule } from "@/src/hooks/useAdminModule";

function formatCurrency(amount: number): string {
  return `$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export default function AdminDashboardScreen() {
  const { error, isEmpty, isLoading, isRefreshing, refresh, summary } =
    useAdminModule();

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
            Consulta el estado actual de la plataforma desde la app móvil.
          </Text>
        </View>

        {isEmpty && (
          <View style={styles.emptyBanner}>
            <Text style={styles.emptyBannerText}>
              Aún no hay movimientos para mostrar. Los indicadores aparecerán en
              cero hasta que exista información registrada.
            </Text>
          </View>
        )}

        <View style={styles.metricsGrid}>
          <DashboardMetricCard
            label="Afiliados activos"
            value={summary.activeAffiliates.toString()}
          />
          <DashboardMetricCard
            label="Empleadores activos"
            value={summary.activeEmployers.toString()}
          />
          <DashboardMetricCard
            label="Aportes pendientes"
            value={summary.pendingContributions.toString()}
          />
          <DashboardMetricCard
            label="Balance administrado"
            value={formatCurrency(summary.managedBalance)}
          />
          <DashboardMetricCard
            label="Aportes mensuales"
            value={formatCurrency(summary.monthlyContributions)}
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
    gap: 16,
  },
  header: {
    gap: 4,
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
    borderRadius: 12,
    padding: 14,
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
  },
});
