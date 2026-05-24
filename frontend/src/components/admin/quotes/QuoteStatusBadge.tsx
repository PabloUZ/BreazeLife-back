import { StyleSheet, Text, View } from "react-native";
import type { QuoteStatus } from "@/src/dtos/admin/admin.dtos";
import {
  getQuoteStatusColors,
  getQuoteStatusLabel,
} from "@/src/components/admin/quotes/quoteUtils";

type QuoteStatusBadgeProps = {
  status: QuoteStatus;
};

export default function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  const colors = getQuoteStatusColors(status);

  return (
    <View style={[styles.badge, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.label, { color: colors.color }]}>
        {getQuoteStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
