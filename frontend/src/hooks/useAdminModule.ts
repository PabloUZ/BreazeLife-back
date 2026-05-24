import { Alert } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";
import { getAdminDashboardSummary } from "@/src/services/api/adminDashboardService";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import type { AdminDashboardSummaryDto } from "@/src/dtos/admin/admin.dtos";

const EMPTY_SUMMARY: AdminDashboardSummaryDto = {
  activeAffiliates: 0,
  activeEmployers: 0,
  pendingContributions: 0,
  managedBalance: 0,
  monthlyContributions: 0,
};

export type AdminModuleState = {
  error: string | null;
  isEmpty: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isReady: boolean;
  refresh: () => Promise<void>;
  summary: AdminDashboardSummaryDto;
};

function isUnauthorizedError(error: ApiErrorResponseDto): boolean {
  return error.status_code === 401;
}

export function useAdminModule(): AdminModuleState {
  const router = useRouter();
  const { signOut } = useAuth();
  const [summary, setSummary] = useState<AdminDashboardSummaryDto>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnauthorized = useCallback(async () => {
    Alert.alert(
      "Sesión expirada",
      "Tu sesión expiró. Inicia sesión nuevamente para continuar."
    );
    await signOut();
    router.replace("/(auth)/login");
  }, [router, signOut]);

  const loadSummary = useCallback(async (manualRefresh = false) => {
    try {
      if (manualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const dashboardSummary = await getAdminDashboardSummary();
      setSummary({
        activeAffiliates: dashboardSummary.activeAffiliates ?? 0,
        activeEmployers: dashboardSummary.activeEmployers ?? 0,
        pendingContributions: dashboardSummary.pendingContributions ?? 0,
        managedBalance: dashboardSummary.managedBalance ?? 0,
        monthlyContributions: dashboardSummary.monthlyContributions ?? 0,
      });
    } catch (rawError) {
      const apiError = rawError as ApiErrorResponseDto;

      if (isUnauthorizedError(apiError)) {
        await handleUnauthorized();
        return;
      }

      setSummary(EMPTY_SUMMARY);
      setError(
        apiError.status_code === 403
          ? "No tienes permisos para ver el dashboard administrativo."
          : apiError.message ||
              "No se pudo cargar el resumen del dashboard. Intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    error,
    isEmpty: Object.values(summary).every((value) => value === 0),
    isLoading,
    isRefreshing,
    isReady: !isLoading,
    refresh: () => loadSummary(true),
    summary,
  };
}
