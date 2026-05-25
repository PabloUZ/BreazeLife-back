import type { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import { spacing } from "@/src/theme";

type AdminScreenContainerProps = PropsWithChildren<{
  testID?: string;
}>;

export default function AdminScreenContainer({
  children,
  testID,
}: AdminScreenContainerProps) {
  return (
    <ScreenContainer contentStyle={styles.content} testID={testID}>
      {children}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xxxl + spacing.md,
  },
});
