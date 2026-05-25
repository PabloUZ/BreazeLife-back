import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import EmployerScreenContainer from "@/src/components/layout/EmployerScreenContainer";
import { useAuthContext } from "@/src/context/AuthContext";
import { listEmployees } from "@/src/services/api/employeeService";
import { getFunds } from "@/src/services/api/fundService";
import { getPayrollHistory } from "@/src/services/api/payrollService";
import { colors, spacing, typography } from "@/src/theme";
import { formatCurrency, formatPeriod } from "@/src/utils/formatters";

type ReportsOverviewState = {
  activeEmployees: number;
  payrollCount: number;
  latestPayrollPeriod: string | null;
  sourcesLoaded: number;
  totalBalance: number;
  totalContributionsSnapshot: number;
};

type SummaryMetric = {
  helperText?: string;
  label: string;
  value: string;
};

type ReportCardItem = {
  actionLabel: string;
  description: string;
  enabled: boolean;
  helperText?: string;
  href?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
};

const REPORT_ITEMS: ReportCardItem[] = [
  {
    title: "Reporte de nomina",
    description: "Consulta los periodos procesados y el detalle de cada ejecucion.",
    actionLabel: "Ver reporte",
    href: "/(tabs)/(employer)/payroll/history",
    enabled: true,
    iconName: "receipt-outline",
  },
  {
    title: "Historial de aportes",
    description: "Revisa el flujo reciente de aportes y movimientos asociados.",
    actionLabel: "Ver reporte",
    href: "/(tabs)/(employer)/funds",
    enabled: true,
    iconName: "trending-up-outline",
  },
  {
    title: "Movimientos de fondos",
    description: "Explora recargas, descuentos y balances de los fondos empresariales.",
    actionLabel: "Ver reporte",
    href: "/(tabs)/(employer)/funds",
    enabled: true,
    iconName: "wallet-outline",
  },
  {
    title: "Empleados activos",
    description: "Accede a la plantilla actual y valida el estado operativo del personal.",
    actionLabel: "Ver reporte",
    href: "/(tabs)/(employer)/employees",
    enabled: true,
    iconName: "people-outline",
  },
  {
    title: "Resumen financiero",
    description: "Exporta un consolidado ejecutivo cuando exista una salida dedicada.",
    actionLabel: "Proximamente",
    enabled: false,
    iconName: "document-text-outline",
  },
];

function SummaryCard({ metric }: { metric: SummaryMetric }) {
  return (
    <AppCard compact style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{metric.label}</Text>
      <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
        {metric.value}
      </Text>
      {metric.helperText ? <Text style={styles.summaryHelper}>{metric.helperText}</Text> : null}
    </AppCard>
  );
}

function ReportCard({
  item,
  onPress,
}: {
  item: ReportCardItem;
  onPress?: () => void;
}) {
  const content = (
    <AppCard style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportIconWrap}>
          <Ionicons name={item.iconName} size={18} color={colors.primary} />
        </View>
        <AppStatusBadge
          label={item.enabled ? "Disponible" : "Pendiente"}
          tone={item.enabled ? "success" : "warning"}
        />
      </View>

      <Text style={styles.reportTitle}>{item.title}</Text>
      <Text style={styles.reportDescription}>{item.description}</Text>
      {item.helperText ? <Text style={styles.reportHelper}>{item.helperText}</Text> : null}

      <AppButton
        title={item.actionLabel}
        variant={item.enabled ? "secondary" : "ghost"}
        iconName={item.enabled ? "arrow-forward-outline" : "time-outline"}
        onPress={onPress}
        disabled={!item.enabled}
      />
    </AppCard>
  );

  if (!item.enabled || !onPress) {
    return content;
  }

  return (
    <Pressable style={styles.pressableCard} onPress={onPress}>
      {content}
    </Pressable>
  );
}

export default function EmployerReportsScreen() {
  const router = useRouter();
  const { state } = useAuthContext();
  const employerId = state.user?.user_id ?? "";

  const [overview, setOverview] = useState<ReportsOverviewState | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(
    async (isRefresh = false) => {
      if (!employerId) {
        setError("No se encontro la sesion del empleador.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [employeesResult, payrollResult, fundsResult] = await Promise.allSettled([
        listEmployees(employerId, { page: 0, size: 1, status: "ACTIVE" }),
        getPayrollHistory({ page: 0, limit: 12 }),
        getFunds(employerId),
      ]);

      const sourcesLoaded = [employeesResult, payrollResult, fundsResult].filter(
        (result) => result.status === "fulfilled"
      ).length;

      if (sourcesLoaded === 0) {
        setOverview(null);
        setError("No se pudo cargar la vista de reportes. Intenta de nuevo.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const payrollItems =
        payrollResult.status === "fulfilled" ? payrollResult.value.data.items ?? [] : [];
      const funds = fundsResult.status === "fulfilled" ? fundsResult.value : [];

      setOverview({
        activeEmployees:
          employeesResult.status === "fulfilled" ? employeesResult.value.totalElements : 0,
        payrollCount:
          payrollResult.status === "fulfilled"
            ? payrollResult.value.data.pagination.total_items
            : 0,
        latestPayrollPeriod: payrollItems[0]?.period ?? null,
        totalBalance: funds.reduce((total, fund) => total + fund.balance, 0),
        totalContributionsSnapshot: payrollItems.reduce(
          (total, item) => total + item.total_pension_contrib,
          0
        ),
        sourcesLoaded,
      });

      setLoading(false);
      setRefreshing(false);
    },
    [employerId]
  );

  useFocusEffect(
    useCallback(() => {
      loadOverview();
    }, [loadOverview])
  );

  if (loading) {
    return (
      <EmployerScreenContainer>
        <AppLoadingState message="Cargando reportes empresariales..." />
      </EmployerScreenContainer>
    );
  }

  if (error && !overview) {
    return (
      <EmployerScreenContainer>
        <AppErrorState message={error} onRetry={() => loadOverview()} />
      </EmployerScreenContainer>
    );
  }

  const summaryMetrics: SummaryMetric[] = [
    {
      label: "Total aportes",
      value: formatCurrency(overview?.totalContributionsSnapshot ?? 0),
      helperText: "Snapshot del historial cargado",
    },
    {
      label: "Total empleados",
      value: new Intl.NumberFormat("es-CO").format(overview?.activeEmployees ?? 0),
      helperText: "Empleados activos registrados",
    },
    {
      label: "Ultima nomina",
      value: overview?.latestPayrollPeriod
        ? formatPeriod(overview.latestPayrollPeriod)
        : "Sin registros",
      helperText: overview?.latestPayrollPeriod
        ? "Segun el historial disponible"
        : "Aun sin periodos procesados",
    },
    {
      label: "Balance actual",
      value: formatCurrency(overview?.totalBalance ?? 0),
      helperText: `${overview?.payrollCount ?? 0} nominas en historial`,
    },
  ];

  const reportItems = REPORT_ITEMS.map((item) => {
    if (item.title === "Reporte de nomina") {
      return {
        ...item,
        helperText:
          overview?.latestPayrollPeriod != null
            ? `Ultimo periodo: ${formatPeriod(overview.latestPayrollPeriod)}`
            : "Aun no hay periodos procesados",
      };
    }

    if (item.title === "Empleados activos") {
      return {
        ...item,
        helperText: `${overview?.activeEmployees ?? 0} empleados listos para consulta`,
      };
    }

    if (item.title === "Movimientos de fondos") {
      return {
        ...item,
        helperText: `Balance consolidado: ${formatCurrency(overview?.totalBalance ?? 0)}`,
      };
    }

    if (item.title === "Historial de aportes") {
      return {
        ...item,
        helperText: `Aportes visibles: ${formatCurrency(overview?.totalContributionsSnapshot ?? 0)}`,
      };
    }

    return item;
  });

  return (
    <EmployerScreenContainer>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadOverview(true)}
            tintColor={colors.primary}
          />
        }
      >
        <AppHeader
          title="Reportes Empresariales"
          subtitle="Consulta informacion financiera y operativa de la empresa."
        />

        <AppCard variant="tint" style={styles.heroCard}>
          <Text style={styles.heroTitle}>Centro de consulta empresarial</Text>
          <Text style={styles.heroText}>
            Revisa rapidamente los reportes disponibles y navega a las rutas ya
            conectadas del modulo Employer sin salir del flujo actual.
          </Text>
          <View style={styles.heroMetaRow}>
            <AppStatusBadge
              label={`${overview?.sourcesLoaded ?? 0}/3 fuentes cargadas`}
              tone={(overview?.sourcesLoaded ?? 0) === 3 ? "success" : "warning"}
            />
            <Text style={styles.heroMetaText}>Sin descargas simuladas ni endpoints nuevos.</Text>
          </View>
        </AppCard>

        {(overview?.sourcesLoaded ?? 0) < 3 ? (
          <AppCard variant="muted">
            <Text style={styles.noticeTitle}>Datos parciales</Text>
            <Text style={styles.noticeText}>
              El resumen usa informacion disponible y mantiene acciones seguras
              en los reportes que todavia no tienen salida dedicada.
            </Text>
          </AppCard>
        ) : null}

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Resumen rapido</Text>
          <View style={styles.summaryGrid}>
            {summaryMetrics.map((metric) => (
              <SummaryCard key={metric.label} metric={metric} />
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Reportes disponibles</Text>
          <View style={styles.reportList}>
            {reportItems.map((item) => {
              const handlePress = item.href
                ? () => router.push(item.href as never)
                : undefined;

              return <ReportCard key={item.title} item={item} onPress={handlePress} />;
            })}
          </View>
        </View>
      </ScrollView>
    </EmployerScreenContainer>
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
  heroCard: {
    gap: spacing.sm,
    backgroundColor: colors.surfacePrimary,
    borderColor: colors.primarySoft,
  },
  heroTitle: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  heroText: {
    ...typography.body,
    color: colors.textMuted,
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  heroMetaText: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  noticeTitle: {
    ...typography.bodyStrong,
    color: colors.neutralText,
    marginBottom: spacing.xs,
  },
  noticeText: {
    ...typography.body,
    color: colors.textMuted,
  },
  sectionBlock: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 145,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.sectionTitle,
    color: colors.neutralText,
  },
  summaryHelper: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  reportList: {
    gap: spacing.md,
  },
  pressableCard: {
    borderRadius: 16,
  },
  reportCard: {
    gap: spacing.md,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  reportIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceTint,
  },
  reportTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },
  reportDescription: {
    ...typography.body,
    color: colors.textMuted,
  },
  reportHelper: {
    ...typography.caption,
    color: colors.textSubtle,
  },
});
