import type { Href } from "expo-router";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

type PlaceholderLinkButtonProps = {
  href: Href;
  label: string;
};

export default function PlaceholderLinkButton({
  href,
  label,
}: PlaceholderLinkButtonProps) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.button}>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
});
