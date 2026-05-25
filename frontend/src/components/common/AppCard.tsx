import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "@/src/theme";

type AppCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "muted" | "tint";
  compact?: boolean;
}>;

export default function AppCard({
  children,
  style,
  variant = "default",
  compact = false,
}: AppCardProps) {
  return (
    <View
      style={[
        styles.base,
        compact ? styles.compact : styles.regular,
        variant === "muted" ? styles.muted : null,
        variant === "tint" ? styles.tint : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  regular: {
    padding: spacing.lg,
  },
  compact: {
    padding: spacing.md,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
  },
  tint: {
    backgroundColor: colors.surfaceTint,
  },
});
