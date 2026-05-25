import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AffiliatesByFundTypeChart from "@/src/components/admin/charts/AffiliatesByFundTypeChart";
import FundDistributionChart from "@/src/components/admin/charts/FundDistributionChart";
import MonthlyContributionsChart from "@/src/components/admin/charts/MonthlyContributionsChart";
import QuotesByStatusChart from "@/src/components/admin/charts/QuotesByStatusChart";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import { useAdminDashboardGraphs } from "@/src/hooks/useAdminDashboardGraphs";

export default function AdminReportsScreen() {
  const { error, graphs, isEmpty, isLoading, isRefreshing, refresh } =
    useAdminDashboardGraphs();

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#369BC9" />
          <Text style={styles.loadingText}>Cargando graficas del dashboard...</Text>
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
          <Text style={styles.title}>Graficas del sistema</Text>
          <Text style={styles.subtitle}>
            Analiza cotizaciones, aportes, afiliados y distribucion de fondos
            desde una sola vista.
          </Text>
        </View>

        {isEmpty ? (
          <View style={styles.emptyBanner}>
            <Text style={styles.emptyBannerText}>
              Todavia no hay datos graficos para mostrar. Cuando existan
              registros en el sistema, apareceran aqui.
            </Text>
          </View>
        ) : null}

        <View style={styles.chartsList}>
          <QuotesByStatusChart data={graphs.quotesByStatus} />
          <MonthlyContributionsChart data={graphs.monthlyContributions} />
          <AffiliatesByFundTypeChart data={graphs.affiliatesByFundType} />
          <FundDistributionChart data={graphs.fundDistribution} />
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
  chartsList: {
    gap: 16,
  },
});
