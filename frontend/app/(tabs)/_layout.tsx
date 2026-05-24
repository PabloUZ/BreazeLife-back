import { Stack, Redirect } from "expo-router";
import { useAuthContext } from "@/src/context/AuthContext";

export default function TabsRootLayout() {
  const { isLoading, state } = useAuthContext();

  // Si no está autenticado, mandarlo al login
  if (!isLoading && !state.isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(affiliate)" />
      <Stack.Screen name="(employer)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}
