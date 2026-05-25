import type { PropsWithChildren } from "react";
import { SafeAreaView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, spacing } from "@/src/theme";

type ScreenContainerProps = PropsWithChildren<{
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export default function ScreenContainer({
  children,
  contentStyle,
  testID,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.content, contentStyle]} testID={testID}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.screen,
    gap: spacing.lg,
  },
});
