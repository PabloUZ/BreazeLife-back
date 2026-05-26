import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import AppCard from "@/src/components/common/AppCard";
import AppHeader from "@/src/components/common/AppHeader";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import { spacing } from "@/src/theme";

type PlaceholderScreenProps = PropsWithChildren<{
  contentStyle?: StyleProp<ViewStyle>;
  title: string;
  subtitle: string;
}>;

export default function PlaceholderScreen({
  title,
  subtitle,
  children,
  contentStyle,
}: PlaceholderScreenProps) {
  return (
    <ScreenContainer contentStyle={contentStyle}>
      <AppHeader title={title} subtitle={subtitle} />
      <AppCard variant="muted">
        <View style={styles.content}>
          {children}
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
});
