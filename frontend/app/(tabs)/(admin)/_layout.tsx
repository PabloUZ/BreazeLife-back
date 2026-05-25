import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useAuthContext } from "@/src/context/AuthContext";

const ROLE_ROUTES = {
  affiliate: "/(tabs)/(affiliate)/dashboard",
  employer: "/(tabs)/(employer)/dashboard",
  guest: "/(auth)/login",
} as const;

export default function AdminTabsLayout() {
  const { isLoading, state } = useAuthContext();

  if (isLoading) {
    return null;
  }

  if (!state.isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (state.role !== "admin") {
    return <Redirect href={ROLE_ROUTES[state.role] as never} />;
  }

  return (
    <Tabs screenOptions={{ headerShown: true, tabBarHideOnKeyboard: true }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="affiliates"
        options={{
          title: "Cuentas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="employers" options={{ href: null }} />
      <Tabs.Screen
        name="quotes"
        options={{
          title: "Cotizaciones",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Graficas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profitability"
        options={{
          title: "Rentabilidad",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Configuración",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="quote-detail" options={{ href: null }} />
    </Tabs>
  );
}
