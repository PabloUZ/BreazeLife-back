import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSharedTabScreenOptions } from "@/src/theme/navigation";

export default function EmployerTabsLayout() {
  const sharedTabScreenOptions = useSharedTabScreenOptions();

  return (
    <Tabs screenOptions={{ ...sharedTabScreenOptions, headerShown: false }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          title: "Empleados",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payroll"
        options={{
          title: "Nomina",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
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
        name="index"
        options={{
          title: "Mas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="funds" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="register-employee" options={{ href: null }} />
      <Tabs.Screen name="employee-detail" options={{ href: null }} />
      <Tabs.Screen name="edit-employee" options={{ href: null }} />
      <Tabs.Screen name="change-salary-position" options={{ href: null }} />
      <Tabs.Screen name="salary-history" options={{ href: null }} />
    </Tabs>
  );
}
