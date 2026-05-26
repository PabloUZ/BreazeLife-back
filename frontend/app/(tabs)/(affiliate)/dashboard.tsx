import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PensionProgressWidget from "@/src/components/affiliate/PensionProgressWidget";
import { RentabilityHistory } from "@/src/components/affiliate/RentabilityHistory";
import AppCard from "@/src/components/common/AppCard";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import AffiliateScreenContainer from "@/src/components/layout/AffiliateScreenContainer";
import { useAuthContext } from "@/src/context/AuthContext";
import type { AffiliateDashboardDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { getAffiliateDashboard } from "@/src/services/api/affiliateService";
import { colors, spacing, typography } from "@/src/theme";
import { formatCurrency, formatDecimal } from "@/src/utils/formatters";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CONSERVATIVE: "Conservador",
  MODERATE: "Moderado",
  RISKY: "Arriesgado",
};

function formatContribDate(isoDate: string): string {
  if (!isoDate) {
    return "Sin fecha";
  }

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

function getContributionTone(status?: string) {
  switch ((status ?? "").toUpperCase()) {
    case "PROCESSED":
      return "success" as const;
    case "PENDING":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

export default function AffiliateDashboardScreen() {
  const { state } = useAuthContext();
  const [dashboard, setDashboard] = useState<AffiliateDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await getAffiliateDashboard();
      setDashboard(data);
    } catch {
      setError("No se pudo cargar el dashboard. Verifica tu conexion.");
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
      <AffiliateScreenContainer>
        <AppLoadingState message="Cargando tu dashboard..." />
      </AffiliateScreenContainer>
    );
  }

  if (error || !dashboard) {
    return (
      <AffiliateScreenContainer>
        <AppErrorState message={error ?? "Error inesperado"} onRetry={() => load()} />
      </AffiliateScreenContainer>
    );
  }

  const accountTypeLabel =
    ACCOUNT_TYPE_LABELS[dashboard.accountType] ?? dashboard.accountType ?? "Cuenta pensional";

  return (
    <AffiliateScreenContainer>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={colors.primary}
          />
        }
      >
        <AppHeader
          title="Mi dashboard"
          subtitle={`Hola, ${state.user?.first_name ?? "afiliado"}. Consulta tu avance, tu saldo y tus aportes recientes.`}
        />

        <AppCard variant="tint" style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo acumulado</Text>
          <Text style={styles.balanceValue}>{formatCurrency(dashboard.balance)}</Text>
          <Text style={styles.balanceMeta}>
            {accountTypeLabel}
            {dashboard.accountId ? ` - ${dashboard.accountId}` : ""}
          </Text>
        </AppCard>

        <View style={styles.metricsRow}>
          <AppCard compact style={styles.metricCard}>
            <Text style={styles.metricLabel}>Semanas cotizadas</Text>
            <Text style={styles.metricValue}>{formatDecimal(dashboard.quotedWeeks)}</Text>
            <Text style={styles.metricHelper}>de 1.300</Text>
          </AppCard>
          <AppCard compact style={styles.metricCard}>
            <Text style={styles.metricLabel}>Semanas restantes</Text>
            <Text style={styles.metricValue}>{formatDecimal(dashboard.weeksRemaining)}</Text>
            <Text style={styles.metricHelper}>Para cumplir la meta</Text>
          </AppCard>
        </View>

        <PensionProgressWidget
          data={{
            accumulatedWeeks: dashboard.quotedWeeks,
            missingWeeks: dashboard.weeksRemaining,
            progressPercentage: dashboard.progressPercentage,
          }}
        />

        {dashboard.monthlyProfitability ? (
          <AppCard>
            <Text style={styles.cardLabel}>Rentabilidad del mes</Text>
            <Text style={styles.cardValue}>
              {formatCurrency(dashboard.monthlyProfitability.profit)}
            </Text>
            <Text style={styles.cardHelper}>
              Corte: {formatContribDate(dashboard.monthlyProfitability.date)}
            </Text>
          </AppCard>
        ) : null}

        {dashboard.lastContribution ? (
          <AppCard>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderCopy}>
                <Text style={styles.cardLabel}>Ultimo aporte</Text>
                <Text style={styles.cardHelper}>
                  {formatContribDate(dashboard.lastContribution.contribDate)}
                </Text>
              </View>
              <AppStatusBadge
                label={dashboard.lastContribution.status || "UNKNOWN"}
                tone={getContributionTone(dashboard.lastContribution.status)}
              />
            </View>

            <Text style={styles.cardValue}>
              {formatCurrency(dashboard.lastContribution.totalContribution)}
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
                <Text style={styles.breakdownLabel}>Dias</Text>
                <Text style={styles.breakdownValue}>
                  {formatDecimal(dashboard.lastContribution.daysContributed, 0)}
                </Text>
              </View>
            </View>
          </AppCard>
        ) : null}

        <RentabilityHistory />
      </ScrollView>
    </AffiliateScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  balanceCard: {
    backgroundColor: colors.surfacePrimary,
    borderColor: colors.primarySoft,
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  balanceValue: {
    ...typography.value,
    color: colors.text,
  },
  balanceMeta: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 140,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  metricHelper: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  cardHeaderCopy: {
    flex: 1,
  },
  cardLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: spacing.xs,
  },
  cardValue: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  cardHelper: {
    ...typography.body,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  breakdownRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  breakdownItem: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 88,
  },
  breakdownLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: spacing.xs,
  },
  breakdownValue: {
    ...typography.bodyStrong,
    color: colors.neutralText,
  },
});
