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
  helperText?: string;
  href: string;
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
};

const REPORT_ITEMS: ReportCardItem[] = [
  {
    title: "Reporte de nomina",
    description: "Consulta los periodos procesados y revisa el detalle operativo de cada ejecucion.",
    actionLabel: "Ver reporte",
    href: "/(tabs)/(employer)/payroll/history",
    iconName: "receipt-outline",
  },
  {
    title: "Historial de aportes",
    description: "Revisa el flujo reciente de aportes registrados y su comportamiento general.",
    actionLabel: "Ver reporte",
    href: "/(tabs)/(employer)/funds",
    iconName: "trending-up-outline",
  },
  {
    title: "Movimientos de fondos",
    description: "Explora recargas, descuentos y balance disponible en los fondos empresariales.",
    actionLabel: "Ver reporte",
    href: "/(tabs)/(employer)/funds",
    iconName: "wallet-outline",
  },
  {
    title: "Empleados activos",
    description: "Accede a la plantilla actual y valida el estado operativo del personal registrado.",
    actionLabel: "Ver reporte",
    href: "/(tabs)/(employer)/employees",
    iconName: "people-outline",
  },
];

function SummaryCard({ metric }: { metric: SummaryMetric }) {
  return (
    <AppCard compact style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{metric.label}</Text>
      <Text
        style={styles.summaryValue}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
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
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.pressableCard} onPress={onPress}>
      <AppCard style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <View style={styles.reportIconWrap}>
            <Ionicons name={item.iconName} size={18} color={colors.primary} />
          </View>
          <AppStatusBadge label="Disponible" tone="success" />
        </View>

        <Text style={styles.reportTitle}>{item.title}</Text>
        <Text style={styles.reportDescription}>{item.description}</Text>
        {item.helperText ? <Text style={styles.reportHelper}>{item.helperText}</Text> : null}

        <AppButton
          title={item.actionLabel}
          variant="secondary"
          iconName="arrow-forward-outline"
          onPress={onPress}
        />
      </AppCard>
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

      const hasAnySource =
        employeesResult.status === "fulfilled" ||
        payrollResult.status === "fulfilled" ||
        fundsResult.status === "fulfilled";

      if (!hasAnySource) {
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
      helperText: "Resumen del historial cargado",
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
        : "Aun no hay periodos procesados",
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
            : "Consulta disponible desde que exista historial",
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

    return {
      ...item,
      helperText: `Aportes visibles: ${formatCurrency(overview?.totalContributionsSnapshot ?? 0)}`,
    };
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
          <Text style={styles.heroTitle}>Panel de reportes operativos</Text>
          <Text style={styles.heroText}>
            Revisa los accesos clave del modulo Employer para consultar nomina,
            aportes, fondos y plantilla activa desde una sola vista.
          </Text>
          <View style={styles.heroMetaRow}>
            <AppStatusBadge label="Listo para consulta" tone="info" />
            <Text style={styles.heroMetaText}>
              Navegacion conectada a vistas reales del modulo empresarial.
            </Text>
          </View>
        </AppCard>

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
            {reportItems.map((item) => (
              <ReportCard
                key={item.title}
                item={item}
                onPress={() => router.push(item.href as never)}
              />
            ))}
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
    gap: spacing.xl,
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
  sectionBlock: {
    gap: spacing.lg,
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
    marginTop: -spacing.xs,
  },
});
