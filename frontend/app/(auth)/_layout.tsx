import { Redirect, Stack } from "expo-router";
import { useAuthContext } from "@/src/context/AuthContext";

const ROLE_ROUTES = {
  affiliate: "/(tabs)/(affiliate)/dashboard",
  employer: "/(tabs)/(employer)/dashboard",
  admin: "/(tabs)/(admin)/dashboard",
} as const;

export default function AuthLayout() {
  const { isLoading, state } = useAuthContext();

  if (!isLoading && state.isAuthenticated) {
    const route = ROLE_ROUTES[state.role as keyof typeof ROLE_ROUTES];
    if (route) {
      return <Redirect href={route as never} />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen
        name="forgot-password"
        options={{ title: "Recuperar contrasena" }}
      />
    </Stack>
  );
}
