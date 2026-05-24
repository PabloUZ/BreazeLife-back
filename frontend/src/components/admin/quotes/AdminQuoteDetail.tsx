import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import QuoteStatusBadge from "@/src/components/admin/quotes/QuoteStatusBadge";
import {
  formatCurrency,
  formatDateTime,
  getQuoteStatusLabel,
} from "@/src/components/admin/quotes/quoteUtils";
import type { AdminQuoteDto } from "@/src/dtos/admin/admin.dtos";

type AdminQuoteDetailProps = {
  quote: AdminQuoteDto;
};

function DetailField({
  label,
  muted,
  value,
}: {
  label: string;
  muted?: boolean;
  value: string;
}) {
  return (
    <View style={styles.fieldCard}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, muted && styles.fieldValueMuted]}>
        {value}
      </Text>
    </View>
  );
}

function DetailSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function ContributionCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.contributionCard}>
      <Text style={styles.contributionLabel}>{label}</Text>
      <Text style={styles.contributionValue}>{value}</Text>
    </View>
  );
}

export default function AdminQuoteDetail({ quote }: AdminQuoteDetailProps) {
  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.eyebrow}>Cotizacion en revision</Text>
        <Text style={styles.title}>{quote.quoteId}</Text>
        <Text style={styles.subtitle}>Cuenta: {quote.accountId}</Text>
        <QuoteStatusBadge status={quote.status} />

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Aporte total</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(quote.totalContribution)}
          </Text>
        </View>

        <View style={styles.contributionsGrid}>
          <ContributionCard
            label="Empleador"
            value={formatCurrency(quote.employerContribution)}
          />
          <ContributionCard
            label="Afiliado"
            value={formatCurrency(quote.affiliateContribution)}
          />
        </View>
      </View>

      <DetailSection
        title="Detalle de la cotizacion"
        description="Informacion financiera y de trazabilidad reportada por el backend."
      >
        <DetailField label="Quote ID" value={quote.quoteId} />
        <DetailField label="Account ID" value={quote.accountId} />
        <DetailField label="Payment ID" value={quote.paymentId} />
        <DetailField label="Dias cotizados" value={String(quote.daysContributed)} />
        <DetailField
          label="Fecha de aporte"
          value={formatDateTime(quote.contributionDate)}
        />
      </DetailSection>

      <DetailSection
        title="Revision administrativa"
        description="Estado de aprobacion, responsable y comentarios de revision."
      >
        <DetailField label="Estado" value={getQuoteStatusLabel(quote.status)} />
        <DetailField
          label="Revisado por"
          muted={!quote.reviewedBy}
          value={quote.reviewedBy || "N/A"}
        />
        <DetailField
          label="Fecha de revision"
          muted={formatDateTime(quote.reviewedAt) === "N/A"}
          value={formatDateTime(quote.reviewedAt)}
        />
        <DetailField
          label="Comentario"
          muted={!quote.comment}
          value={quote.comment || "Sin comentario registrado"}
        />
      </DetailSection>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5EEF5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#369BC9",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  totalCard: {
    marginTop: 4,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#F9FAFB",
    gap: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  totalValue: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 36,
  },
  contributionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  contributionCard: {
    flex: 1,
    minWidth: 140,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#EFF6FF",
    gap: 4,
  },
  contributionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E40AF",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  contributionValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5EEF5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
  },
  sectionContent: {
    gap: 10,
    marginTop: 6,
  },
  fieldCard: {
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    padding: 14,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  fieldValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    lineHeight: 20,
  },
  fieldValueMuted: {
    color: "#6B7280",
    fontWeight: "500",
  },
});
