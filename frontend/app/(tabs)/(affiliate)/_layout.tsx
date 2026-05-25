import { StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AffiliateContributionToastListener from "@/src/components/affiliate/AffiliateContributionToastListener";
import { useSharedTabScreenOptions } from "@/src/theme/navigation";

export default function AffiliateTabsLayout() {
  const sharedTabScreenOptions = useSharedTabScreenOptions();

  return (
    <View style={styles.container}>
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
          name="contributions"
          options={{
            title: "Aportes",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cash-outline" size={size} color={color} />
            ),
          }}
        />
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
          name="simulator"
          options={{
            title: "Simulador",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calculator-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="documents"
          options={{
            title: "Documentos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="folder-outline" size={size} color={color} />
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
          name="payments"
          options={{
            title: "Pagos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="payment-detail"
          options={{
            href: null,
            title: "Detalle de pago",
          }}
        />

        <Tabs.Screen name="index" options={{ href: null }} />
      </Tabs>

      <AffiliateContributionToastListener />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
