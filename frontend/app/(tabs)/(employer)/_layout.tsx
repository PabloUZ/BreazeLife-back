import { Tabs } from "expo-router";

export default function EmployerTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="employees" options={{ title: "Employees" }} />
      <Tabs.Screen name="payroll" options={{ title: "Payroll" }} />
      <Tabs.Screen name="funds" options={{ title: "Funds" }} />
      <Tabs.Screen name="reports" options={{ title: "Reports" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
    </Tabs>
  );
}
