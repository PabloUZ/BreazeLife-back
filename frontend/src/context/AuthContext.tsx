import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type AppRole = "guest" | "affiliate" | "employer" | "admin";

export type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;
  refreshToken: string | null;
  role: AppRole;
};

export type AuthContextValue = {
  setRole: (role: AppRole) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  state: AuthState;
};

const initialAuthState: AuthState = {
  accessToken: null,
  isAuthenticated: false,
  refreshToken: null,
  role: "guest",
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(initialAuthState);

  const setRole = useCallback((role: AppRole) => {
    setState((currentState) => ({
      ...currentState,
      role,
    }));
  }, []);

  const signIn = useCallback(async () => {
    // TODO: Implement JWT auth, secure token storage and role guards.
  }, []);

  const signOut = useCallback(async () => {
    setState(initialAuthState);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      setRole,
      signIn,
      signOut,
      state,
    }),
    [setRole, signIn, signOut, state],
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
