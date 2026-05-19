import { Tabs } from "expo-router";

export default function AffiliateTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="contributions" options={{ title: "Contributions" }} />
      <Tabs.Screen name="simulator" options={{ title: "Simulator" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
      <Tabs.Screen name="documents" options={{ title: "Documents" }} />
    </Tabs>
  );
}
