import type { PropsWithChildren } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

type ScreenContainerProps = PropsWithChildren<{
  testID?: string;
}>;

export default function ScreenContainer({
  children,
  testID,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content} testID={testID}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
});
