import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "@/src/theme";

type AppButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function AppButton({
  title,
  variant = "primary",
  loading = false,
  disabled,
  iconName,
  style,
  textStyle,
  ...pressableProps
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const palette = getPalette(variant, isDisabled);

  return (
    <Pressable
      {...pressableProps}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: pressed && !isDisabled ? 0.9 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.textColor} />
      ) : (
        <View style={styles.content}>
          {iconName ? (
            <Ionicons name={iconName} size={16} color={palette.textColor} />
          ) : null}
          <Text style={[styles.label, { color: palette.textColor }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function getPalette(variant: AppButtonProps["variant"], disabled?: boolean) {
  if (disabled) {
    return {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primarySoft,
      textColor: colors.primaryText,
    };
  }

  switch (variant) {
    case "secondary":
      return {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        textColor: colors.text,
      };
    case "danger":
      return {
        backgroundColor: colors.dangerSoft,
        borderColor: colors.dangerSoft,
        textColor: colors.dangerText,
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        borderColor: "transparent",
        textColor: colors.primary,
      };
    case "primary":
    default:
      return {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        textColor: colors.primaryText,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    ...typography.bodyStrong,
  },
});
