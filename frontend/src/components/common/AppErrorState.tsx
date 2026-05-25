import { StyleSheet, Text, View } from "react-native";
import AppButton from "@/src/components/common/AppButton";
import { colors, spacing, typography } from "@/src/theme";

type AppErrorStateProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export default function AppErrorState({
  message,
  onRetry,
  retryLabel = "Reintentar",
}: AppErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <AppButton title={retryLabel} onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  message: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
  },
});
