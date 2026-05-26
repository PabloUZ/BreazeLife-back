import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import AppEmptyState from "@/src/components/common/AppEmptyState";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AdminScreenContainer from "@/src/components/layout/AdminScreenContainer";
import DashboardMetricCard from "@/src/components/admin/DashboardMetricCard";
import { useAdminModule } from "@/src/hooks/useAdminModule";
import { spacing } from "@/src/theme";

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
      <AdminScreenContainer>
        <AppLoadingState message="Cargando resumen del dashboard..." />
      </AdminScreenContainer>
    );
  }

  if (error) {
    return (
      <AdminScreenContainer>
        <AppErrorState message={error} onRetry={refresh} />
      </AdminScreenContainer>
    );
  }

  return (
    <AdminScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
      >
        <View style={styles.contentInner}>
          <View style={styles.headerBlock}>
            <AppHeader
              title="Resumen general"
              subtitle="Consulta el estado actual de la plataforma desde la app movil."
            />
          </View>

          {isEmpty ? (
            <View style={styles.fullWidthBlock}>
              <AppEmptyState
                title="Sin actividad registrada"
                description="Los indicadores apareceran en cero hasta que exista informacion en el sistema."
              />
            </View>
          ) : null}

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
        </View>
      </ScrollView>
    </AdminScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    gap: 18,
    alignItems: "center",
  },
  contentInner: {
    width: "100%",
    maxWidth: 760,
    gap: 18,
  },
  headerBlock: {
    width: "100%",
  },
  fullWidthBlock: {
    width: "100%",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
    marginHorizontal: -4,
  },
});
