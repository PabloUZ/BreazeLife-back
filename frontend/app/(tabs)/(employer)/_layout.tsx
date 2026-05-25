import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSharedTabScreenOptions } from "@/src/theme/navigation";

export default function EmployerTabsLayout() {
  const sharedTabScreenOptions = useSharedTabScreenOptions();

  return (
    <Tabs screenOptions={sharedTabScreenOptions}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Inicio",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          title: "Empleados",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payroll"
        options={{
          title: "Nomina",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="funds"
        options={{
          title: "Fondos",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reportes",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alertas",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="register-employee"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="employee-detail"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="edit-employee"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="change-salary-position"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="salary-history"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
