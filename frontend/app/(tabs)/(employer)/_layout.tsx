import { useCallback, useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useSharedTabScreenOptions } from "@/src/theme/navigation";
import { useAuthContext } from "@/src/context/AuthContext";
import { notificationSocket } from "@/src/services/ws/notificationSocket";
import { getNotifications } from "@/src/services/api/notificationService";

export default function EmployerTabsLayout() {
  const { state } = useAuthContext();
  const [unreadCount, setUnreadCount] = useState(0);

  // Conectar WebSocket globalmente y escuchar nuevas notificaciones
  useEffect(() => {
    if (!state.accessToken) return;

    // Cargar conteo inicial de no leídas
    getNotifications(state.role)
      .then((items) => {
        setUnreadCount(items.filter((n: any) => !n.read).length);
      })
      .catch(() => { });

    const unsubscribe = notificationSocket.subscribe(
      (incoming) => {
        if (!incoming.read) {
          setUnreadCount((prev) => prev + 1);
        }
      },
      () => { },
      () => { }
    );

    notificationSocket.connect(state.accessToken);

    return () => {
      unsubscribe();
    };
  }, [state.accessToken, state.role]);

  // Resetear conteo cuando el usuario entra a la pestaña de notificaciones
  const resetUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const sharedTabScreenOptions = useSharedTabScreenOptions();

  return (
    <Tabs
      screenOptions={{ ...sharedTabScreenOptions, headerShown: false }}
      screenListeners={{
        tabPress: (e) => {
          if (e.target?.startsWith("notifications")) {
            resetUnread();
          }
        },
      }}
    >
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
            <View>
              <Ionicons name="notifications-outline" size={size} color={color} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -6,
                    backgroundColor: "#EF4444",
                    borderRadius: 8,
                    minWidth: 16,
                    height: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 3,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: "700",
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>
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
      
      {/* Pantallas ocultas que no deben aparecer en el menú inferior */}
      <Tabs.Screen name="register-employee" options={{ href: null }} />
      <Tabs.Screen name="employee-detail" options={{ href: null }} />
      <Tabs.Screen name="edit-employee" options={{ href: null }} />
      <Tabs.Screen name="change-salary-position" options={{ href: null }} />
      <Tabs.Screen name="salary-history" options={{ href: null }} />
    </Tabs>
  );
}