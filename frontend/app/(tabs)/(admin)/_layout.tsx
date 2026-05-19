import { Tabs } from "expo-router";

export default function AdminTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="affiliates" options={{ title: "Affiliates" }} />
      <Tabs.Screen name="employers" options={{ title: "Employers" }} />
      <Tabs.Screen name="quotes" options={{ title: "Quotes" }} />
      <Tabs.Screen name="reports" options={{ title: "Reports" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
    </Tabs>
  );
}
