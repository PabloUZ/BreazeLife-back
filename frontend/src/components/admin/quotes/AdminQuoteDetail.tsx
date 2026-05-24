import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { AdminQuoteDto } from "@/src/dtos/admin/admin.dtos";
import QuoteStatusBadge from "@/src/components/admin/quotes/QuoteStatusBadge";
import {
  formatCurrency,
  formatDateTime,
} from "@/src/components/admin/quotes/quoteUtils";

type AdminQuoteDetailProps = {
  quote: AdminQuoteDto;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function AdminQuoteDetail({ quote }: AdminQuoteDetailProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{quote.quoteId}</Text>
        <Text style={styles.subtitle}>Cuenta: {quote.accountId}</Text>
        <QuoteStatusBadge status={quote.status} />
      </View>

      <DetailSection title="Informacion de la cotizacion">
        <DetailRow label="Quote ID" value={quote.quoteId} />
        <DetailRow label="Account ID" value={quote.accountId} />
        <DetailRow label="Payment ID" value={quote.paymentId} />
        <DetailRow
          label="Aporte empleador"
          value={formatCurrency(quote.employerContribution)}
        />
        <DetailRow
          label="Aporte afiliado"
          value={formatCurrency(quote.affiliateContribution)}
        />
        <DetailRow
          label="Aporte total"
          value={formatCurrency(quote.totalContribution)}
        />
        <DetailRow
          label="Dias cotizados"
          value={String(quote.daysContributed)}
        />
        <DetailRow
          label="Fecha de aporte"
          value={formatDateTime(quote.contributionDate)}
        />
      </DetailSection>

      <DetailSection title="Revision administrativa">
        <DetailRow label="Estado" value={quote.status} />
        <DetailRow label="Revisado por" value={quote.reviewedBy || "N/A"} />
        <DetailRow
          label="Fecha de revision"
          value={formatDateTime(quote.reviewedAt)}
        />
        <DetailRow label="Comentario" value={quote.comment || "N/A"} />
      </DetailSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 8,
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  rowLabel: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },
  rowValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
});
