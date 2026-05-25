import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/src/context/AuthContext";
import LoginForm from "@/src/components/auth/LoginForm";
import { getMe } from "@/src/services/api/authService";
import type { LoginResponseDto } from "@/src/dtos/auth/auth.dtos";

type LoginData = LoginResponseDto["data"];

const ROLE_ROUTES = {
  affiliate: "/(tabs)/(affiliate)/dashboard",
  employer:  "/(tabs)/(employer)/dashboard",
  admin:     "/(tabs)/(admin)/dashboard",
} as const;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuthContext();

  const handleSuccess = async (data: LoginData) => {
    const me = await getMe(data.access_token);
    await signIn(data.access_token, data.refresh_token, me.data);
    const role = me.data.role.toLowerCase() as keyof typeof ROLE_ROUTES;
    router.replace((ROLE_ROUTES[role] ?? ROLE_ROUTES.affiliate) as never);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <LoginForm onSuccess={handleSuccess} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta?</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.footerLink}>Regístrate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
          <Text style={styles.footerLink}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 24,
    paddingTop: 40,
    gap: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  footerLink: {
    fontSize: 14,
    color: "#369BC9",
    fontWeight: "600",
  },
});
