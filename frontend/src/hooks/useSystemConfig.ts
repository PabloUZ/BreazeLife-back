import { Alert } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";
import { getSystemConfig, updateSystemConfig } from "@/src/services/api/systemConfigService";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import type { SystemConfigDto, UpdateSystemConfigDto } from "@/src/dtos/admin/systemConfig.dtos";

const DEFAULT_CONFIG: SystemConfigDto = {
  rate_conservative: 0.004,
  rate_moderate: 0.006,
  rate_risky: 0.008,
  life_expectancy: 62,
  contribution_rate: 0.16,
};

export type SystemConfigState = {
  config: SystemConfigDto;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isSaving: boolean;
  refresh: () => Promise<void>;
  saveConfig: (data: UpdateSystemConfigDto) => Promise<boolean>;
};

function isUnauthorizedError(e: ApiErrorResponseDto): boolean {
  return e.status_code === 401;
}

export function useSystemConfig(): SystemConfigState {
  const router = useRouter();
  const { signOut } = useAuth();

  const [config, setConfig] = useState<SystemConfigDto>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnauthorized = useCallback(async () => {
    Alert.alert("Sesión expirada", "Inicia sesión nuevamente para continuar.");
    await signOut();
    router.replace("/(auth)/login");
  }, [router, signOut]);

  const loadConfig = useCallback(async (manualRefresh = false) => {
    try {
      if (manualRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);
      const data = await getSystemConfig();
      setConfig(data);
    } catch (rawError) {
      const apiError = rawError as ApiErrorResponseDto;
      if (isUnauthorizedError(apiError)) {
        await handleUnauthorized();
        return;
      }
      setError(apiError.message || "No se pudo cargar la configuración.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [handleUnauthorized]);

  const saveConfig = useCallback(async (data: UpdateSystemConfigDto): Promise<boolean> => {
    try {
      setIsSaving(true);
      const updated = await updateSystemConfig(data);
      setConfig(updated);
      Alert.alert("✅ Configuración guardada", "Los parámetros del sistema han sido actualizados correctamente.");
      return true;
    } catch (rawError) {
      const apiError = rawError as ApiErrorResponseDto;
      if (isUnauthorizedError(apiError)) {
        await handleUnauthorized();
        return false;
      }
      Alert.alert(
        "Error al guardar",
        apiError.message || "No se pudo guardar la configuración. Verifica los valores e intenta de nuevo."
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    error,
    isLoading,
    isRefreshing,
    isSaving,
    refresh: () => loadConfig(true),
    saveConfig,
  };
}

