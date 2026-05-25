import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import SignupForm from "@/src/components/auth/SignupForm";
import { colors, spacing, typography } from "@/src/theme";

export default function RegisterScreen() {
  const router = useRouter();

  const handleSuccess = () => {
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <SignupForm onSuccess={handleSuccess} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.footerLink}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.screen,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
    marginBottom: 36,
  },
  footerText: {
    ...typography.body,
    color: colors.textMuted,
  },
  footerLink: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
});
