import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "@/src/theme";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

type AppStatusBadgeProps = {
  label: string;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
};

export default function AppStatusBadge({
  label,
  tone = "neutral",
  style,
}: AppStatusBadgeProps) {
  const palette = getPalette(tone);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.backgroundColor },
        style,
      ]}
    >
      <Text style={[styles.label, { color: palette.textColor }]}>{label}</Text>
    </View>
  );
}

function getPalette(tone: Tone) {
  switch (tone) {
    case "success":
      return {
        backgroundColor: colors.successSoft,
        textColor: colors.successText,
      };
    case "warning":
      return {
        backgroundColor: colors.warningSoft,
        textColor: colors.warningText,
      };
    case "danger":
      return {
        backgroundColor: colors.dangerSoft,
        textColor: colors.dangerText,
      };
    case "info":
      return {
        backgroundColor: colors.infoSoft,
        textColor: colors.infoText,
      };
    case "neutral":
    default:
      return {
        backgroundColor: colors.neutralSoft,
        textColor: colors.neutralText,
      };
  }
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  label: {
    ...typography.caption,
  },
});
