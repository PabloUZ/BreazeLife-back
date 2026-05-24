import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type DashboardMetricCardProps = {
  cardWidth?: number;
  helperText?: string;
  label: string;
  value: string;
  fullWidth?: boolean;
  iconName?: ComponentProps<typeof Ionicons>["name"];
};

export default function DashboardMetricCard({
  cardWidth,
  helperText,
  label,
  value,
  fullWidth,
  iconName,
}: DashboardMetricCardProps) {
  return (
    <View
      style={[
        styles.card,
        fullWidth && styles.cardWide,
        cardWidth !== undefined && !fullWidth ? { width: cardWidth } : null,
        fullWidth && styles.cardFullWidth,
      ]}
    >
      {iconName ? (
        <View style={styles.iconBadge}>
          <Ionicons name={iconName} size={18} color="#369BC9" />
        </View>
      ) : null}

      <View style={[styles.header, fullWidth && styles.headerWide]}>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </View>

      <View style={[styles.valueGroup, fullWidth && styles.valueGroupWide]}>
        <Text
          style={styles.value}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          {value}
        </Text>
        {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 152,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5EEF5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
  },
  cardWide: {
    minHeight: 122,
  },
  cardFullWidth: {
    width: "100%",
  },
  header: {
    minHeight: 42,
    paddingRight: 38,
  },
  headerWide: {
    minHeight: 0,
    paddingRight: 44,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    lineHeight: 17,
  },
  iconBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  valueGroup: {
    gap: 4,
    marginTop: "auto",
  },
  valueGroupWide: {
    marginTop: 10,
  },
  value: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 36,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
});
