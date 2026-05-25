import { StyleSheet, Text, View } from "react-native";
import AppCard from "@/src/components/common/AppCard";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import type { QuoteResponseDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { colors, spacing, typography } from "@/src/theme";
import { useSystemConfigContext, formatContributionRate } from "@/src/context/SystemConfigContext";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function getStatusTone(status: string) {
  switch (status) {
    case "ACCEPTED":
      return { label: "Aprobada", tone: "success" as const };
    case "PENDING":
      return { label: "Pendiente", tone: "warning" as const };
    case "REJECTED":
      return { label: "Rechazada", tone: "danger" as const };
    default:
      return { label: status, tone: "neutral" as const };
  }
}

export function QuoteCard({ quote }: { quote: QuoteResponseDto }) {
  const status = getStatusTone(quote.status);
  const { config } = useSystemConfigContext();

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.dateText}>
            {new Date(quote.contribDate).toLocaleDateString("es-CO")}
          </Text>
          <Text style={styles.idText} numberOfLines={1} ellipsizeMode="tail">
            Ref: {quote.quoteId}
          </Text>
        </View>
        <AppStatusBadge label={status.label} tone={status.tone} />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Dias cotizados</Text>
        <Text style={styles.valueText}>{quote.daysContributed} dias</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Tu aporte</Text>
        <Text style={styles.valueText}>{formatCurrency(quote.affiliateContrib)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Aporte empresa</Text>
        <Text style={styles.valueText}>{formatCurrency(quote.employerContrib)}</Text>
      </View>

      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>
          Total cotizado ({formatContributionRate(config.contribution_rate)})
        </Text>
        <Text style={styles.totalValue}>{formatCurrency(quote.totalContrib)}</Text>
      </View>

      {quote.status === "REJECTED" && quote.comment ? (
        <Text style={styles.errorText}>Motivo: {quote.comment}</Text>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  dateText: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  idText: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
  },
  valueText: {
    ...typography.bodyStrong,
    color: colors.neutralText,
    flexShrink: 1,
    textAlign: "right",
  },
  totalBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  totalLabel: {
    ...typography.bodyStrong,
    color: colors.neutralText,
    flex: 1,
  },
  totalValue: {
    ...typography.cardTitle,
    color: colors.primary,
    flexShrink: 1,
    textAlign: "right",
  },
  errorText: {
    ...typography.caption,
    color: colors.dangerText,
    marginTop: spacing.sm,
  },
});
