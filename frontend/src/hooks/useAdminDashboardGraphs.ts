import { Alert } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";
import { getAdminDashboardGraphs } from "@/src/services/api/adminDashboardService";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import type { AdminDashboardGraphsDto } from "@/src/dtos/admin/admin.dtos";

const EMPTY_GRAPHS: AdminDashboardGraphsDto = {
  quotesByStatus: [],
  monthlyContributions: [],
  affiliatesByFundType: [],
  fundDistribution: [],
};

export type AdminDashboardGraphsState = {
  error: string | null;
  graphs: AdminDashboardGraphsDto;
  isEmpty: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
};

function isUnauthorizedError(error: ApiErrorResponseDto): boolean {
  return error.status_code === 401;
}

export function useAdminDashboardGraphs(): AdminDashboardGraphsState {
  const router = useRouter();
  const { signOut } = useAuth();
  const [graphs, setGraphs] = useState<AdminDashboardGraphsDto>(EMPTY_GRAPHS);
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

  const loadGraphs = useCallback(
    async (manualRefresh = false) => {
      try {
        if (manualRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const dashboardGraphs = await getAdminDashboardGraphs();
        setGraphs({
          quotesByStatus: dashboardGraphs.quotesByStatus ?? [],
          monthlyContributions: dashboardGraphs.monthlyContributions ?? [],
          affiliatesByFundType: dashboardGraphs.affiliatesByFundType ?? [],
          fundDistribution: dashboardGraphs.fundDistribution ?? [],
        });
      } catch (rawError) {
        const apiError = rawError as ApiErrorResponseDto;

        if (isUnauthorizedError(apiError)) {
          await handleUnauthorized();
          return;
        }

        setGraphs(EMPTY_GRAPHS);
        setError(
          apiError.status_code === 403
            ? "No tienes permisos para ver las gráficas administrativas."
            : apiError.message ||
                "No se pudieron cargar las gráficas del dashboard. Intenta de nuevo."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleUnauthorized]
  );

  useEffect(() => {
    loadGraphs();
  }, [loadGraphs]);

  return {
    error,
    graphs,
    isEmpty:
      graphs.quotesByStatus.length === 0 &&
      graphs.monthlyContributions.length === 0 &&
      graphs.affiliatesByFundType.length === 0 &&
      graphs.fundDistribution.length === 0,
    isLoading,
    isRefreshing,
    refresh: () => loadGraphs(true),
  };
}
