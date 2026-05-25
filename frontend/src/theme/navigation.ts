import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";

export function useSharedTabScreenOptions(): BottomTabNavigationOptions {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, spacing.md);

  return {
    headerShown: true,
    headerStyle: {
      backgroundColor: colors.surface,
    },
    headerTintColor: colors.text,
    headerShadowVisible: false,
    headerTitleStyle: {
      ...typography.cardTitle,
      color: colors.text,
    },
    sceneStyle: {
      backgroundColor: colors.background,
    },
    tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.tabInactive,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 2,
    },
    tabBarItemStyle: {
      paddingTop: 6,
      paddingBottom: 2,
    },
    tabBarStyle: {
      height: 62 + bottomInset,
      paddingTop: spacing.sm,
      paddingBottom: bottomInset,
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
    },
  };
}
