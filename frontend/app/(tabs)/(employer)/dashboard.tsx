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
import type { EmployerEmployeeDto } from "@/src/dtos/employer/employee.dtos";
import type { PayrollHistoryItemDto } from "@/src/dtos/employer/employer.dtos";
import type { FundDto } from "@/src/dtos/fund/fund.dto";
import { listEmployees } from "@/src/services/api/employeeService";
import { getFunds } from "@/src/services/api/fundService";
import { getPayrollHistory } from "@/src/services/api/payrollService";
import { colors, spacing, typography } from "@/src/theme";
import { formatCurrency, formatDate, formatPeriod } from "@/src/utils/formatters";

type DashboardMetric = {
  helperText: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isFallback?: boolean;
  label: string;
  value: string;
};

type ActivityItem = {
  description: string;
  href?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  statusLabel?: string;
  statusTone?: "success" | "warning" | "danger" | "info" | "neutral";
  title: string;
};

type QuickAction = {
  href: string;
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  variant?: "primary" | "secondary";
};

type DashboardState = {
  activeEmployees: number;
  funds: FundDto[];
  payrollCount: number;
  payrollHistory: PayrollHistoryItemDto[];
  recentEmployee: EmployerEmployeeDto | null;
  sourcesLoaded: number;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Gestionar empleados",
    href: "/(tabs)/(employer)/employees",
    iconName: "people-outline",
  },
  {
    title: "Procesar nomina",
    href: "/(tabs)/(employer)/payroll/payroll",
    iconName: "cash-outline",
  },
  {
    title: "Ver reportes",
    href: "/(tabs)/(employer)/reports",
    iconName: "bar-chart-outline",
    variant: "secondary",
  },
  {
    title: "Revisar fondos",
    href: "/(tabs)/(employer)/funds",
    iconName: "wallet-outline",
    variant: "secondary",
  },
];

function formatCompactCurrency(value: number): string {
  const absoluteValue = Math.abs(value);
  const units = [
    { divisor: 1_000_000_000, suffix: "B" },
    { divisor: 1_000_000, suffix: "M" },
    { divisor: 1_000, suffix: "K" },
  ];

  for (const unit of units) {
    if (absoluteValue >= unit.divisor) {
      const scaledValue = value / unit.divisor;
      return `${new Intl.NumberFormat("es-CO", {
        maximumFractionDigits: Number.isInteger(scaledValue) ? 0 : 1,
      }).format(scaledValue)}${unit.suffix}`;
    }
  }

  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPayrollStatus(status?: string) {
  switch ((status ?? "").toUpperCase()) {
    case "PROCESSED":
      return { label: "Procesada", tone: "success" as const };
    case "PENDING":
      return { label: "Pendiente", tone: "warning" as const };
    default:
      return { label: status ?? "Sin estado", tone: "neutral" as const };
  }
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <AppCard compact style={styles.metricCard}>
      <View style={styles.metricIconWrap}>
        <Ionicons name={metric.iconName} size={18} color={colors.primary} />
      </View>

      <Text style={styles.metricLabel}>{metric.label}</Text>
      <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>
        {metric.value}
      </Text>
      <Text style={styles.metricHelper}>{metric.helperText}</Text>

      {metric.isFallback ? (
        <AppStatusBadge label="Fallback" tone="warning" style={styles.metricBadge} />
      ) : null}
    </AppCard>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <AppCard compact style={styles.activityCard}>
      <View style={styles.activityIconWrap}>
        <Ionicons name={item.iconName} size={18} color={colors.infoText} />
      </View>

      <View style={styles.activityCopy}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          {item.statusLabel ? (
            <AppStatusBadge
              label={item.statusLabel}
              tone={item.statusTone ?? "neutral"}
            />
          ) : null}
        </View>
        <Text style={styles.activityDescription}>{item.description}</Text>
      </View>

      {item.href ? (
        <Ionicons name="chevron-forward-outline" size={18} color={colors.textSubtle} />
      ) : null}
    </AppCard>
  );
}

export default function EmployerDashboardScreen() {
  const router = useRouter();
  const { state } = useAuthContext();
  const employerId = state.user?.user_id ?? "";
  const firstName = state.user?.first_name ?? "equipo";

  const [dashboard, setDashboard] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(
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

      const [activeEmployeesResult, recentEmployeesResult, payrollHistoryResult, fundsResult] =
        await Promise.allSettled([
          listEmployees(employerId, { page: 0, size: 1, status: "ACTIVE" }),
          listEmployees(employerId, { page: 0, size: 1 }),
          getPayrollHistory({ page: 0, limit: 5 }),
          getFunds(employerId),
        ]);

      const sourcesLoaded = [
        activeEmployeesResult,
        recentEmployeesResult,
        payrollHistoryResult,
        fundsResult,
      ].filter((result) => result.status === "fulfilled").length;

      if (sourcesLoaded === 0) {
        setDashboard(null);
        setError("No se pudo cargar el resumen empresarial. Intenta de nuevo.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setDashboard({
        activeEmployees:
          activeEmployeesResult.status === "fulfilled"
            ? activeEmployeesResult.value.totalElements
            : 0,
        payrollCount:
          payrollHistoryResult.status === "fulfilled"
            ? payrollHistoryResult.value.data.pagination.total_items
            : 0,
        recentEmployee:
          recentEmployeesResult.status === "fulfilled"
            ? recentEmployeesResult.value.content[0] ?? null
            : null,
        payrollHistory:
          payrollHistoryResult.status === "fulfilled"
            ? payrollHistoryResult.value.data.items ?? []
            : [],
        funds: fundsResult.status === "fulfilled" ? fundsResult.value : [],
        sourcesLoaded,
      });

      setLoading(false);
      setRefreshing(false);
    },
    [employerId]
  );

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  if (loading) {
    return (
      <EmployerScreenContainer>
        <AppLoadingState message="Cargando dashboard empresarial..." />
      </EmployerScreenContainer>
    );
  }

  if (error && !dashboard) {
    return (
      <EmployerScreenContainer>
        <AppErrorState message={error} onRetry={() => loadDashboard()} />
      </EmployerScreenContainer>
    );
  }

  const funds = dashboard?.funds ?? [];
  const payrollHistory = dashboard?.payrollHistory ?? [];
  const latestPayroll = payrollHistory[0];
  const payrollFund = funds.find((fund) => fund.type === "PAYROLL");
  const pensionFund = funds.find((fund) => fund.type === "PENSION");
  const combinedFundBalance = funds.reduce((total, fund) => total + fund.balance, 0);
  const payrollStatus = formatPayrollStatus(latestPayroll?.status);

  const metrics: DashboardMetric[] = [
    {
      label: "Empleados activos",
      value: new Intl.NumberFormat("es-CO").format(dashboard?.activeEmployees ?? 0),
      helperText: "Personal actualmente vinculado",
      iconName: "people-outline",
    },
    {
      label: "Nominas procesadas",
      value: new Intl.NumberFormat("es-CO").format(dashboard?.payrollCount ?? 0),
      helperText: latestPayroll
        ? `Ultimo periodo: ${formatPeriod(latestPayroll.period)}`
        : "Sin periodos procesados",
      iconName: "receipt-outline",
    },
    {
      label: "Fondos de nomina",
      value: formatCompactCurrency(payrollFund?.balance ?? combinedFundBalance),
      helperText: payrollFund
        ? formatCurrency(payrollFund.balance)
        : "Balance combinado de fondos",
      iconName: "wallet-outline",
    },
    {
      label: "Aportes pendientes",
      value: "0",
      helperText: "Indicador provisional sin endpoint dedicado",
      iconName: "time-outline",
      isFallback: true,
    },
  ];

  const activities: ActivityItem[] = [
    latestPayroll
      ? {
          title: "Ultima nomina procesada",
          description: `${formatPeriod(latestPayroll.period)} · ${latestPayroll.total_employees} empleados · ${formatCurrency(latestPayroll.total_debit)}`,
          iconName: "cash-outline",
          statusLabel: payrollStatus.label,
          statusTone: payrollStatus.tone,
          href: "/(tabs)/(employer)/payroll/history",
        }
      : {
          title: "Ultima nomina procesada",
          description: "Aun no hay nominas procesadas para mostrar.",
          iconName: "cash-outline",
          statusLabel: "Sin registros",
          statusTone: "neutral",
        },
    latestPayroll
      ? {
          title: "Ultimo aporte realizado",
          description: `${formatCurrency(latestPayroll.total_pension_contrib)} registrados el ${formatDate(latestPayroll.executed_at)}`,
          iconName: "trending-up-outline",
          statusLabel: "Registrado",
          statusTone: "success",
          href: "/(tabs)/(employer)/funds",
        }
      : {
          title: "Ultimo aporte realizado",
          description: "Los aportes apareceran cuando exista historial de nomina.",
          iconName: "trending-up-outline",
          statusLabel: "Pendiente",
          statusTone: "warning",
        },
    dashboard?.recentEmployee
      ? {
          title: "Ultimo empleado registrado",
          description: `${dashboard.recentEmployee.firstName} ${dashboard.recentEmployee.lastName} · ${dashboard.recentEmployee.position} · Inicio ${formatDate(dashboard.recentEmployee.startDate)}`,
          iconName: "person-add-outline",
          statusLabel:
            dashboard.recentEmployee.status === "ACTIVE" ? "Activo" : "Inactivo",
          statusTone:
            dashboard.recentEmployee.status === "ACTIVE" ? "success" : "neutral",
          href: "/(tabs)/(employer)/employees",
        }
      : {
          title: "Ultimo empleado registrado",
          description: "Todavia no hay empleados registrados en la empresa.",
          iconName: "person-add-outline",
          statusLabel: "Sin registros",
          statusTone: "neutral",
        },
  ];

  return (
    <EmployerScreenContainer>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor={colors.primary}
          />
        }
      >
        <AppHeader
          title="Dashboard Empresarial"
          subtitle="Consulta el estado general de tu empresa y aportes."
        />

        <AppCard variant="tint" style={styles.welcomeCard}>
          <Text style={styles.welcomeEyebrow}>Bienvenido de nuevo</Text>
          <Text style={styles.welcomeTitle}>Hola, {firstName}.</Text>
          <Text style={styles.welcomeDescription}>
            Revisa rapidamente el personal activo, los fondos disponibles y la
            actividad operativa reciente de tu empresa.
          </Text>

          <View style={styles.welcomeMetaRow}>
            <AppStatusBadge
              label={`${dashboard?.sourcesLoaded ?? 0}/4 fuentes cargadas`}
              tone={(dashboard?.sourcesLoaded ?? 0) === 4 ? "success" : "warning"}
            />
            <Text style={styles.welcomeMetaText}>
              Balance total: {formatCurrency(combinedFundBalance)}
            </Text>
          </View>
        </AppCard>

        {(dashboard?.sourcesLoaded ?? 0) < 4 ? (
          <AppCard variant="muted">
            <Text style={styles.noticeTitle}>Vista con datos parciales</Text>
            <Text style={styles.noticeText}>
              Algunas secciones usan informacion disponible y mantienen fallback
              seguro mientras las fuentes restantes responden.
            </Text>
          </AppCard>
        ) : null}

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Resumen general</Text>
          <View style={styles.metricsGrid}>
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          <View style={styles.activityList}>
            {activities.map((item) =>
              item.href ? (
                <Pressable
                  key={item.title}
                  onPress={() => router.push(item.href as never)}
                  style={styles.pressableCard}
                >
                  <ActivityCard item={item} />
                </Pressable>
              ) : (
                <ActivityCard key={item.title} item={item} />
              )
            )}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Acciones rapidas</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <AppButton
                key={action.title}
                title={action.title}
                iconName={action.iconName}
                variant={action.variant ?? "primary"}
                style={styles.quickActionButton}
                onPress={() => router.push(action.href as never)}
              />
            ))}
          </View>
        </View>

        <AppCard style={styles.fundsSummaryCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Fondos disponibles</Text>
            <AppButton
              title="Ver fondos"
              variant="ghost"
              iconName="arrow-forward-outline"
              onPress={() => router.push("/(tabs)/(employer)/funds" as never)}
            />
          </View>

          <View style={styles.fundsRow}>
            <View style={styles.fundSummaryItem}>
              <Text style={styles.fundSummaryLabel}>Fondo de nomina</Text>
              <Text style={styles.fundSummaryValue}>
                {formatCurrency(payrollFund?.balance ?? 0)}
              </Text>
            </View>
            <View style={styles.fundSummaryItem}>
              <Text style={styles.fundSummaryLabel}>Fondo de aportes</Text>
              <Text style={styles.fundSummaryValue}>
                {formatCurrency(pensionFund?.balance ?? 0)}
              </Text>
            </View>
          </View>
        </AppCard>
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
  welcomeCard: {
    gap: spacing.sm,
    backgroundColor: colors.surfacePrimary,
    borderColor: colors.primarySoft,
  },
  welcomeEyebrow: {
    ...typography.caption,
    color: colors.textMuted,
  },
  welcomeTitle: {
    ...typography.title,
    color: colors.text,
  },
  welcomeDescription: {
    ...typography.body,
    color: colors.textMuted,
  },
  welcomeMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  welcomeMetaText: {
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
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 145,
    gap: spacing.xs,
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceTint,
    marginBottom: spacing.sm,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  metricValue: {
    ...typography.value,
    color: colors.text,
  },
  metricHelper: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metricBadge: {
    marginTop: spacing.sm,
  },
  activityList: {
    gap: spacing.md,
  },
  pressableCard: {
    borderRadius: 16,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.infoSoft,
  },
  activityCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  activityTitle: {
    ...typography.bodyStrong,
    color: colors.text,
    flex: 1,
  },
  activityDescription: {
    ...typography.body,
    color: colors.textMuted,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  quickActionButton: {
    flexGrow: 1,
    flexBasis: "47%",
  },
  fundsSummaryCard: {
    gap: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  fundsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  fundSummaryItem: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 145,
  },
  fundSummaryLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: spacing.xs,
  },
  fundSummaryValue: {
    ...typography.sectionTitle,
    color: colors.neutralText,
  },
});
