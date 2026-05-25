import { Stack, Redirect } from "expo-router";
import { useAuthContext } from "@/src/context/AuthContext";

const ROLE_ROUTES = {
  affiliate: "/(tabs)/(affiliate)/dashboard",
  employer:  "/(tabs)/(employer)/dashboard",
  admin:     "/(tabs)/(admin)/dashboard",
} as const;

export default function AuthLayout() {
  const { isLoading, state } = useAuthContext();

  // Si ya está autenticado, sacarlo de auth hacia su dashboard
  if (!isLoading && state.isAuthenticated) {
    const route = ROLE_ROUTES[state.role as keyof typeof ROLE_ROUTES];
    if (route) return <Redirect href={route as never} />;
  }

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="login" options={{ title: "Iniciar sesión" }} />
      <Stack.Screen name="register" options={{ title: "Crear cuenta" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Recuperar contraseña" }} />
    </Stack>
  );
}
