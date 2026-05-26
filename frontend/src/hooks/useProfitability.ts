import { Alert } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";
import {
  applyMonthlyProfitability,
  getProfitabilityHistory,
} from "@/src/services/api/adminProfitabilityService";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import type {
  ApplyProfitabilityResponseDto,
  ProfitabilityHistoryPeriodDto,
} from "@/src/dtos/admin/profitability.dtos";

export type ProfitabilityState = {
  error: string | null;
  history: ProfitabilityHistoryPeriodDto[];
  isApplying: boolean;
  isEmpty: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  lastApplied: ApplyProfitabilityResponseDto | null;
  applyProfitability: () => Promise<void>;
  refresh: () => Promise<void>;
};

function isUnauthorizedError(error: ApiErrorResponseDto): boolean {
  return error.status_code === 401;
}

export function useProfitability(): ProfitabilityState {
  const router = useRouter();
  const { signOut } = useAuth();
  const [history, setHistory] = useState<ProfitabilityHistoryPeriodDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastApplied, setLastApplied] =
    useState<ApplyProfitabilityResponseDto | null>(null);

  const handleUnauthorized = useCallback(async () => {
    Alert.alert(
      "Sesión expirada",
      "Tu sesión expiró. Inicia sesión nuevamente para continuar."
    );
    await signOut();
    router.replace("/(auth)/login");
  }, [router, signOut]);

  const loadHistory = useCallback(async (manualRefresh = false) => {
    try {
      if (manualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const data = await getProfitabilityHistory();
      setHistory(data);
    } catch (rawError) {
      const apiError = rawError as ApiErrorResponseDto;
      if (isUnauthorizedError(apiError)) {
        await handleUnauthorized();
        return;
      }
      setHistory([]);
      setError(
        apiError.message || "No se pudo cargar el historial de rentabilidades."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [handleUnauthorized]);

  const applyProfitability = useCallback(async () => {
    try {
      setIsApplying(true);
      const result = await applyMonthlyProfitability();
      setLastApplied(result);
      Alert.alert(
        "✅ Rentabilidad aplicada",
        `Se procesaron ${result.accounts_processed} cuentas.\nTotal generado: ${formatCurrency(result.total_profit_added)}`
      );
      await loadHistory(true);
    } catch (rawError) {
      const apiError = rawError as ApiErrorResponseDto;
      if (isUnauthorizedError(apiError)) {
        await handleUnauthorized();
        return;
      }
      Alert.alert(
        "Error al aplicar rentabilidad",
        apiError.message_code === "PROFITABILITY_ALREADY_APPLIED"
          ? "La rentabilidad ya fue aplicada este mes. Podrás volver a ejecutarla el próximo mes."
          : apiError.message || "No se pudo aplicar la rentabilidad."
      );
    } finally {
      setIsApplying(false);
    }
  }, [handleUnauthorized, loadHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    error,
    history,
    isApplying,
    isEmpty: history.length === 0,
    isLoading,
    isRefreshing,
    lastApplied,
    applyProfitability,
    refresh: () => loadHistory(true),
  };
}

function formatCurrency(amount: number): string {
  return `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(amount)}`;
}

