import { Stack } from "expo-router";

export default function TabsRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(affiliate)" />
      <Stack.Screen name="(employer)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}
