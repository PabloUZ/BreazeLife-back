import { StyleSheet, Text, View } from "react-native";
import AppCard from "@/src/components/common/AppCard";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import { formatCurrency } from "@/src/utils/formatters";
import { colors, spacing, typography } from "@/src/theme";

export type PayrollCardData = {
  affiliate_name: string;
  position?: string;
  document: string;
  base_salary: number;
  employee_pension_deduction: number;
  net_salary: number;
  employer_pension_contrib: number;
  total_pension_contrib?: number;
  days_contributed?: number;
  quote_id?: string;
  quote_status?: string;
  status?: string;
};

type Props = {
  data: PayrollCardData;
};

function getStatusTone(status?: string) {
  if (!status) return undefined;

  if (status === "SUCCESS" || status === "PROCESSED") {
    return { label: "Exitoso", tone: "success" as const };
  }

  return { label: status, tone: "warning" as const };
}

function getQuoteTone(status?: string) {
  if (!status) return undefined;

  if (status === "PROCESSED" || status === "ACCEPTED") {
    return { label: "Procesada", tone: "success" as const };
  }

  if (status === "REJECTED") {
    return { label: "Rechazada", tone: "danger" as const };
  }

  return { label: status, tone: "warning" as const };
}

function DetailItem({ label, value, tone }: { label: string; value: string; tone?: "danger" | "success" | "default" }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text
        style={[
          styles.itemValue,
          tone === "danger" ? styles.deductionText : null,
          tone === "success" ? styles.netText : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function PayrollEmployeeCard({ data }: Props) {
  const status = getStatusTone(data.status);
  const quoteStatus = getQuoteTone(data.quote_status);
  const totalPension =
    data.total_pension_contrib ??
    data.employer_pension_contrib + data.employee_pension_deduction;

  return (
    <AppCard style={styles.card}>
      <View style={styles.empHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {data.affiliate_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.empInfo}>
          <Text style={styles.empName} numberOfLines={2} ellipsizeMode="tail">
            {data.affiliate_name}
          </Text>
          <Text style={styles.empPosition} numberOfLines={2} ellipsizeMode="tail">
            {data.position ? `${data.position} · ` : ""}
            {data.document}
          </Text>
        </View>
        {status ? <AppStatusBadge label={status.label} tone={status.tone} /> : null}
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <DetailItem label="Salario base" value={formatCurrency(data.base_salary)} />
        <DetailItem
          label="Deduccion pension"
          value={`- ${formatCurrency(data.employee_pension_deduction)}`}
          tone="danger"
        />
        <DetailItem label="Salario neto" value={formatCurrency(data.net_salary)} tone="success" />
      </View>

      <View style={styles.detailRow}>
        <DetailItem
          label="Aporte patronal"
          value={formatCurrency(data.employer_pension_contrib)}
        />
        <DetailItem label="Total pension" value={formatCurrency(totalPension)} />
        <DetailItem
          label="Dias cotizados"
          value={data.days_contributed !== undefined ? `${data.days_contributed} dias` : "30 dias"}
        />
      </View>

      {data.quote_id ? (
        <>
          <View style={styles.divider} />
          <View style={styles.quoteRow}>
            <View style={styles.quoteInfo}>
              <Text style={styles.quoteLabel}>Cotizacion asociada</Text>
              <Text style={styles.quoteValue} numberOfLines={1} ellipsizeMode="tail">
                {data.quote_id}
              </Text>
            </View>
            {quoteStatus ? (
              <AppStatusBadge label={quoteStatus.label} tone={quoteStatus.tone} />
            ) : null}
          </View>
        </>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  empHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: "700",
  },
  empInfo: {
    flex: 1,
    minWidth: 0,
  },
  empName: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  empPosition: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 100,
  },
  itemLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: 2,
  },
  itemValue: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.neutralText,
  },
  deductionText: {
    color: colors.dangerText,
  },
  netText: {
    color: colors.successText,
  },
  quoteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  quoteInfo: {
    flex: 1,
    minWidth: 0,
  },
  quoteLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: 2,
  },
  quoteValue: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.neutralText,
  },
});
