import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QuoteStatusBadge from "@/src/components/admin/quotes/QuoteStatusBadge";
import {
  formatCurrency,
  formatDateTime,
} from "@/src/components/admin/quotes/quoteUtils";
import type { AdminQuoteDto } from "@/src/dtos/admin/admin.dtos";

type AdminQuoteCardProps = {
  onPress: () => void;
  quote: AdminQuoteDto;
};

export default function AdminQuoteCard({
  onPress,
  quote,
}: AdminQuoteCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.quoteId}>{quote.quoteId}</Text>
          <Text style={styles.accountId}>Cuenta: {quote.accountId}</Text>
        </View>
        <QuoteStatusBadge status={quote.status} />
      </View>

      <View style={styles.totalBlock}>
        <Text style={styles.totalLabel}>Aporte total</Text>
        <Text style={styles.totalValue}>
          {formatCurrency(quote.totalContribution)}
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Empleador</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(quote.employerContribution)}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Afiliado</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(quote.affiliateContribution)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerMeta}>
          <Text style={styles.footerText}>
            Fecha: {formatDateTime(quote.contributionDate)}
          </Text>
          <Text style={styles.footerText}>Dias: {quote.daysContributed}</Text>
        </View>
        <View style={styles.detailCta}>
          <Text style={styles.detailLink}>Ver detalle</Text>
          <Ionicons name="chevron-forward" size={18} color="#369BC9" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5EEF5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  quoteId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  accountId: {
    fontSize: 13,
    color: "#6B7280",
  },
  totalBlock: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metric: {
    flex: 1,
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  footer: {
    gap: 10,
  },
  footerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280",
  },
  detailCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  detailLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#369BC9",
  },
});
