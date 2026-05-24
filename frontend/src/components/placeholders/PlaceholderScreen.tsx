import type { PropsWithChildren } from "react";
import { StyleSheet, Text } from "react-native";

import ScreenContainer from "@/src/components/layout/ScreenContainer";

type PlaceholderScreenProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export default function PlaceholderScreen({
  title,
  subtitle,
  children,
}: PlaceholderScreenProps) {
  return (
    <ScreenContainer>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {children}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
  },
});
