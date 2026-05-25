import { useEffect, useState, type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import AffiliateScreenContainer from "@/src/components/layout/AffiliateScreenContainer";
import type { PaymentDetailResponseDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { getPaymentDetail } from "@/src/services/api/affiliateService";
import { colors, spacing, typography } from "@/src/theme";
import { formatCurrency, formatDate, formatPeriod } from "@/src/utils/formatters";
import { useSystemConfigContext, formatContributionRate } from "@/src/context/SystemConfigContext";

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

function getQuoteStatusTone(status?: string | null) {
  if (!status) return { label: "No disponible", tone: "neutral" as const };

  switch (status.toUpperCase()) {
    case "ACCEPTED":
    case "APPROVED":
      return { label: "Aprobada", tone: "success" as const };
    case "PENDING":
      return { label: "Pendiente", tone: "warning" as const };
    case "REJECTED":
      return { label: "Rechazada", tone: "danger" as const };
    default:
      return { label: status, tone: "neutral" as const };
  }
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <AppCard style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </AppCard>
  );
}

function KeyValueRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={styles.keyValueRow}>
      <Text style={styles.keyValueLabel}>{label}</Text>
      <Text style={[styles.keyValueValue, valueStyle]}>{value}</Text>
    </View>
  );
}

export default function AffiliatePaymentDetailScreen() {
  const router = useRouter();
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>();
  const { config } = useSystemConfigContext();

  const [detail, setDetail] = useState<PaymentDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setError("Identificador de pago no proporcionado.");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPaymentDetail(paymentId);
        setDetail(res.data);
      } catch {
        setError("No se pudo cargar el detalle del pago. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [paymentId]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <AffiliateScreenContainer>
          <AppLoadingState message="Cargando detalle de pago..." />
        </AffiliateScreenContainer>
      </>
    );
  }

  if (error || !detail) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <AffiliateScreenContainer>
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={colors.danger}
            />
            <Text style={styles.errorText}>{error ?? "No se encontro este pago."}</Text>
            <AppButton
              title="Volver a pagos"
              variant="secondary"
              iconName="arrow-back-outline"
              onPress={() => router.back()}
            />
          </View>
        </AffiliateScreenContainer>
      </>
    );
  }

  const paymentStatus = getStatusTone(detail.status);
  const quoteStatus = getQuoteStatusTone(detail.quote_status);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AffiliateScreenContainer>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <AppButton
              title="Volver"
              variant="secondary"
              iconName="arrow-back-outline"
              onPress={() => router.back()}
            />
          </View>

          <AppHeader
            title="Detalle de pago"
            subtitle="Revisa el resumen del pago, el desglose salarial y el estado del aporte."
          />

          <AppCard variant="tint">
            <View style={styles.summaryHeader}>
              <View style={styles.summaryCopy}>
                <Text style={styles.summaryPeriod}>{formatPeriod(detail.period)}</Text>
                <Text style={styles.summaryCompany} numberOfLines={2} ellipsizeMode="tail">
                  {detail.company_name}
                </Text>
                <Text style={styles.summaryDate}>
                  Pagado el {formatDate(detail.paid_at)}
                </Text>
              </View>
              <AppStatusBadge label={paymentStatus.label} tone={paymentStatus.tone} />
            </View>
          </AppCard>

          <SectionCard title="Datos laborales">
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Afiliado</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {detail.affiliate_name}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Identificacion</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {detail.document}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Cargo</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {detail.position}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Dias cotizados</Text>
                <Text style={styles.infoValue}>{detail.days_contributed} dias</Text>
              </View>
            </View>
          </SectionCard>

          <SectionCard title="Desglose del pago">
            <KeyValueRow
              label="Salario bruto (IBC)"
              value={formatCurrency(detail.base_salary)}
            />
            <KeyValueRow
              label="Tu deduccion (Pension 4%)"
              value={`- ${formatCurrency(detail.employee_pension_deduction)}`}
              valueStyle={styles.deductionValue}
            />
            <View style={styles.divider} />
            <KeyValueRow
              label="Neto recibido"
              value={formatCurrency(detail.net_salary)}
              valueStyle={styles.totalValue}
            />
          </SectionCard>

          <SectionCard title="Aportes pensionales">
            <KeyValueRow
              label="Tu deduccion (4%)"
              value={formatCurrency(detail.employee_pension_deduction)}
            />
            <KeyValueRow
              label="Aporte empresa (12%)"
              value={formatCurrency(detail.employer_pension_contrib)}
            />
            <View style={styles.divider} />
            <KeyValueRow
              label={`Total cotizado (${formatContributionRate(config.contribution_rate)} IBC)`}
              value={formatCurrency(detail.total_pension_contrib)}
              valueStyle={styles.primaryValue}
            />
          </SectionCard>

          <SectionCard title="Estado del aporte">
            <View style={styles.quoteHeader}>
              <View style={styles.quoteCopy}>
                <Text style={styles.quoteRef}>Ref: {detail.quote_id || "Sin ID"}</Text>
                <Text style={styles.quoteHelp}>
                  Planilla de cotizacion pensional asociada al pago.
                </Text>
              </View>
              <AppStatusBadge label={quoteStatus.label} tone={quoteStatus.tone} />
            </View>

            {detail.quote_status === "PENDING" ? (
              <View style={styles.tipBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={colors.warningText}
                />
                <Text style={styles.tipText}>
                  El aporte del {formatContributionRate(config.contribution_rate)} esta pendiente de aprobacion administrativa.
                  Tu saldo se actualizara cuando el aporte quede aprobado.
                </Text>
              </View>
            ) : null}
          </SectionCard>
        </ScrollView>
      </AffiliateScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  topBar: {
    alignItems: "flex-start",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  summaryCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryPeriod: {
    ...typography.sectionTitle,
    color: colors.text,
    textTransform: "capitalize",
  },
  summaryCompany: {
    ...typography.bodyStrong,
    color: colors.neutralText,
  },
  summaryDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSubtle,
    textTransform: "uppercase",
  },
  sectionBody: {
    gap: spacing.md,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  infoItem: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 132,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  infoValue: {
    ...typography.bodyStrong,
    color: colors.neutralText,
  },
  keyValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  keyValueLabel: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
    minWidth: 140,
  },
  keyValueValue: {
    ...typography.bodyStrong,
    color: colors.neutralText,
    flexShrink: 1,
    textAlign: "right",
    maxWidth: "52%",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  deductionValue: {
    color: colors.dangerText,
  },
  totalValue: {
    ...typography.sectionTitle,
    color: colors.successText,
  },
  primaryValue: {
    ...typography.sectionTitle,
    color: colors.primary,
  },
  quoteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  quoteCopy: {
    flex: 1,
    minWidth: 0,
  },
  quoteRef: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  quoteHelp: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  tipBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.warningSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F9D58B",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  tipText: {
    ...typography.caption,
    color: colors.warningText,
    flex: 1,
  },
});
