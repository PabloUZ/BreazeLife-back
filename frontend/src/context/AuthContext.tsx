import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { secureStoreService } from "@/src/services/storage/SecureStoreService";
import { TOKEN_KEYS } from "@/src/config/http";
import { getMe } from "@/src/services/api/authService";
import type { MeDto } from "@/src/dtos/auth/auth.dtos";

export type AppRole = "guest" | "affiliate" | "employer" | "admin";

export type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;
  refreshToken: string | null;
  role: AppRole;
  user: MeDto | null;
};

export type AuthContextValue = {
  isLoading: boolean;
  signIn: (accessToken: string, refreshToken: string, user: MeDto) => Promise<void>;
  signOut: () => Promise<void>;
  state: AuthState;
};

const initialAuthState: AuthState = {
  accessToken: null,
  isAuthenticated: false,
  refreshToken: null,
  role: "guest",
  user: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function mapRole(raw: string): AppRole {
  switch (raw.toUpperCase()) {
    case "AFFILIATE": return "affiliate";
    case "EMPLOYER":  return "employer";
    case "ADMIN":     return "admin";
    default:          return "guest";
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(initialAuthState);
  const [isLoading, setIsLoading] = useState(true);

  // Restaura la sesión desde SecureStore al arrancar la app
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const accessToken = await secureStoreService.getItem(TOKEN_KEYS.ACCESS);
        const refreshToken = await secureStoreService.getItem(TOKEN_KEYS.REFRESH);

        if (accessToken && refreshToken) {
          // getMe usa el interceptor que ya tiene el token en SecureStore
          const me = await getMe();
          setState({
            accessToken,
            refreshToken,
            isAuthenticated: true,
            role: mapRole(me.data.role),
            user: me.data,
          });
        }
      } catch {
        // Token expirado o inválido — limpiar todo
        await secureStoreService.deleteItem(TOKEN_KEYS.ACCESS);
        await secureStoreService.deleteItem(TOKEN_KEYS.REFRESH);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const signIn = useCallback(
    async (accessToken: string, refreshToken: string, user: MeDto) => {
      await secureStoreService.setItem(TOKEN_KEYS.ACCESS, accessToken);
      await secureStoreService.setItem(TOKEN_KEYS.REFRESH, refreshToken);

      setState({
        accessToken,
        refreshToken,
        isAuthenticated: true,
        role: mapRole(user.role),
        user,
      });
    },
    []
  );

  const signOut = useCallback(async () => {
    await secureStoreService.deleteItem(TOKEN_KEYS.ACCESS);
    await secureStoreService.deleteItem(TOKEN_KEYS.REFRESH);
    setState(initialAuthState);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isLoading, signIn, signOut, state }),
    [isLoading, signIn, signOut, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider.");
  }
  return context;
}
