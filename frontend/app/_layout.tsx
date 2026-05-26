import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/src/context/AuthContext";
import { SystemConfigProvider } from "@/src/context/SystemConfigContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SystemConfigProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SystemConfigProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
