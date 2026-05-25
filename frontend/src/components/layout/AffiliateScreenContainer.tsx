import type { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import { spacing } from "@/src/theme";

type AffiliateScreenContainerProps = PropsWithChildren<{
  testID?: string;
}>;

export default function AffiliateScreenContainer({
  children,
  testID,
}: AffiliateScreenContainerProps) {
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
