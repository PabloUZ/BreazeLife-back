import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppCard from "@/src/components/common/AppCard";
import AppHeader from "@/src/components/common/AppHeader";
import { colors, spacing, typography } from "@/src/theme";

export type MoreMenuItem = {
  description: string;
  href: string;
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
};

type MoreMenuListProps = {
  items: MoreMenuItem[];
  subtitle: string;
  title: string;
};

export default function MoreMenuList({
  items,
  subtitle,
  title,
}: MoreMenuListProps) {
  const router = useRouter();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <AppHeader title={title} subtitle={subtitle} />

      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href as never)}
            style={({ pressed }) => [styles.pressable, pressed ? styles.pressed : null]}
          >
            <AppCard compact style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.iconName} size={18} color={colors.primary} />
              </View>

              <View style={styles.copy}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>

              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color={colors.textSubtle}
              />
            </AppCard>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  pressable: {
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.92,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceTint,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  itemTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  itemDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
