import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { httpClient } from "@/src/config/http";
import type { SystemConfigDto } from "@/src/dtos/admin/systemConfig.dtos";

// ── Defaults (fallback mientras carga o si falla) ─────────────────────────────

const DEFAULT_CONFIG: SystemConfigDto = {
  rate_conservative: 0.004,
  rate_moderate: 0.006,
  rate_risky: 0.008,
  life_expectancy: 62,
  contribution_rate: 0.16,
};

// ── Context ───────────────────────────────────────────────────────────────────

type SystemConfigContextValue = {
  config: SystemConfigDto;
  isLoading: boolean;
  reload: () => Promise<void>;
};

const SystemConfigContext = createContext<SystemConfigContextValue>({
  config: DEFAULT_CONFIG,
  isLoading: true,
  reload: async () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function SystemConfigProvider({ children }: PropsWithChildren) {
  const [config, setConfig] = useState<SystemConfigDto>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await httpClient.get<{ data: SystemConfigDto }>("/api/v1/config");
      setConfig(response.data.data ?? DEFAULT_CONFIG);
    } catch {
      // Si falla, se mantiene el default silenciosamente
      setConfig(DEFAULT_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({ config, isLoading, reload: load }),
    [config, isLoading, load]
  );

  return (
    <SystemConfigContext.Provider value={value}>
      {children}
    </SystemConfigContext.Provider>
  );
}

// ── Hook público ──────────────────────────────────────────────────────────────

export function useSystemConfigContext(): SystemConfigContextValue {
  return useContext(SystemConfigContext);
}

// ── Helpers de formato ────────────────────────────────────────────────────────

/** Convierte decimal a string porcentual: 0.004 → "0.40%" */
export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/** Convierte decimal a string porcentual legible: 0.16 → "16%" */
export function formatContributionRate(rate: number): string {
  const pct = rate * 100;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(2)}%`;
}

