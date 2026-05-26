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
import ReportCard from "@/src/components/admin/reports/ReportCard";
import AdminScreenContainer from "@/src/components/layout/AdminScreenContainer";
import { useAdminDashboardGraphs } from "@/src/hooks/useAdminDashboardGraphs";
import { useAdminReports } from "@/src/hooks/useAdminReports";

export default function AdminReportsScreen() {
  const { error, graphs, isEmpty, isLoading, isRefreshing, refresh } =
    useAdminDashboardGraphs();
  const { quotesStatus, affiliatesStatus, downloadQuotes, downloadAffiliates } =
    useAdminReports();

  if (isLoading) {
    return (
      <AdminScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#369BC9" />
          <Text style={styles.loadingText}>Cargando graficas del dashboard...</Text>
        </View>
      </AdminScreenContainer>
    );
  }

  if (error) {
    return (
      <AdminScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
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
        <View style={styles.header}>
          <Text style={styles.title}>Gráficas y reportes</Text>
          <Text style={styles.subtitle}>
            Descarga reportes PDF o analiza cotizaciones, aportes, afiliados y
            distribución de fondos desde una sola vista.
          </Text>
        </View>

        {/* ── Sección PDF ───────────────────────────────────────── */}
        <View style={styles.pdfSection}>
          <Text style={styles.sectionTitle}>Reportes PDF</Text>
          <Text style={styles.sectionSubtitle}>
            Genera y descarga reportes globales por rango de fechas.
          </Text>

          <ReportCard
            title="Reporte de cotizaciones"
            description="Incluye todas las cotizaciones del período: estado, aportes del empleador y afiliado, días cotizados y total acumulado."
            icon="document-text-outline"
            iconColor="#369BC9"
            iconBg="#EFF6FF"
            requiresDates
            status={quotesStatus}
            onDownload={(params) => params && downloadQuotes({ from: params.from!, to: params.to! })}
          />

          <ReportCard
            title="Reporte de afiliados"
            description="Incluye todos los afiliados: tipo de fondo, saldo, estado, documento y fecha de afiliación. El rango de fechas es opcional."
            icon="people-outline"
            iconColor="#10B981"
            iconBg="#ECFDF5"
            requiresDates={false}
            status={affiliatesStatus}
            onDownload={(params) => downloadAffiliates(params)}
          />
        </View>

        {/* ── Sección Gráficas ──────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gráficas del sistema</Text>
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
    </AdminScreenContainer>
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
  pdfSection: {
    gap: 12,
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 18,
  },
});
