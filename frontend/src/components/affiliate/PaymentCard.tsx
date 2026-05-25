import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppCard from "@/src/components/common/AppCard";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import type { AffiliatePaymentItemDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { colors, spacing, typography } from "@/src/theme";
import { formatCurrency, formatDate, formatPeriod } from "@/src/utils/formatters";

interface PaymentCardProps {
  payment: AffiliatePaymentItemDto;
  onPress: () => void;
}

function getStatusTone(status: string) {
  switch (status.toUpperCase()) {
    case "PROCESSED":
      return { label: "Procesado", tone: "success" as const };
    case "PENDING":
      return { label: "Pendiente", tone: "warning" as const };
    default:
      return { label: status, tone: "neutral" as const };
  }
}

export function PaymentCard({ payment, onPress }: PaymentCardProps) {
  const status = getStatusTone(payment.status);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82}>
      <AppCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerCopy}>
            <Text style={styles.periodText}>{formatPeriod(payment.period)}</Text>
            <Text style={styles.companyName} numberOfLines={2} ellipsizeMode="tail">
              {payment.company_name}
            </Text>
          </View>
          <AppStatusBadge label={status.label} tone={status.tone} />
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Cargo</Text>
            <Text style={styles.valueText} numberOfLines={2} ellipsizeMode="tail">
              {payment.position}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Salario base</Text>
            <Text style={styles.valueText}>{formatCurrency(payment.base_salary)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Fecha de pago</Text>
            <Text style={styles.valueText}>
              {payment.paid_at ? formatDate(payment.paid_at).split(",")[0] : ""}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Neto recibido</Text>
            <Text style={styles.netValue}>{formatCurrency(payment.net_salary)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerActionText}>Ver desglose detallado</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  periodText: {
    ...typography.cardTitle,
    color: colors.text,
    textTransform: "capitalize",
  },
  companyName: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoCol: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 128,
    gap: 2,
  },
  label: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  valueText: {
    ...typography.bodyStrong,
    color: colors.neutralText,
    flexShrink: 1,
  },
  netValue: {
    ...typography.cardTitle,
    color: colors.success,
    flexShrink: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  footerActionText: {
    ...typography.caption,
    color: colors.primary,
  },
});
