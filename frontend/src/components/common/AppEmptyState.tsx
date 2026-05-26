import { StyleSheet, Text, View } from "react-native";
import AppCard from "@/src/components/common/AppCard";
import { colors, spacing, typography } from "@/src/theme";

type AppEmptyStateProps = {
  title: string;
  description: string;
};

export default function AppEmptyState({
  title,
  description,
}: AppEmptyStateProps) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceMuted,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  title: {
    ...typography.cardTitle,
    color: colors.neutralText,
    textAlign: "center",
  },
  description: {
    ...typography.body,
    color: colors.textSubtle,
    textAlign: "center",
  },
});
