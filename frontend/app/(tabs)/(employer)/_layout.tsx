import { router, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function EmployerTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
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
          title: "Nómina",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="funds"
        options={{
          title: "Fondos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reportes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
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
        name="register-employee"
        options={{
          href: null,
          headerShown: true,
          title: "Nuevo empleado",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/(employer)/employees")}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="employee-detail"
        options={{
          href: null,
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/(employer)/employees")}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="edit-employee"
        options={{
          href: null,
          headerShown: true,
          title: "Editar empleado",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/(employer)/employee-detail")}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="change-salary-position"
        options={{
          href: null,
          headerShown: true,
          title: "Cambiar cargo y salario",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/(employer)/edit-employee")}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="salary-history"
        options={{
          href: null,
          headerShown: true,
          title: "Historial salarial",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/(employer)/employee-detail")}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}