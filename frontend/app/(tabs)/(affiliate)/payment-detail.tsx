import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import { getPaymentDetail } from "@/src/services/api/affiliateService";
import type { PaymentDetailResponseDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { formatCurrency, formatPeriod, formatDate } from "@/src/utils/formatters";

export default function AffiliatePaymentDetailScreen() {
  const router = useRouter();
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>();

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
      } catch (err) {
        setError("No se pudo cargar el detalle del pago. Intenta nuevamente.");
        console.error("Error fetching payment detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [paymentId]);

  const getStatusDetails = (status: string) => {
    switch (status.toUpperCase()) {
      case "PROCESSED":
        return { bg: "#D1FAE5", text: "#065F46", label: "Procesado" };
      case "PENDING":
        return { bg: "#FEF3C7", text: "#92400E", label: "Pendiente" };
      default:
        return { bg: "#F3F4F6", text: "#374151", label: status };
    }
  };

  const getQuoteStatusDetails = (status?: string | null) => {
    if (!status) return { bg: "#E5E7EB", text: "#4B5563", label: "No disponible" };
    switch (status.toUpperCase()) {
      case "ACCEPTED":
      case "APPROVED":
        return { bg: "#D1FAE5", text: "#065F46", label: "Aprobada" };
      case "PENDING":
        return { bg: "#FEF3C7", text: "#92400E", label: "Pendiente" };
      case "REJECTED":
        return { bg: "#FEE2E2", text: "#991B1B", label: "Rechazada" };
      default:
        return { bg: "#F3F4F6", text: "#374151", label: status };
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: detail ? `Detalle ${formatPeriod(detail.period)}` : "Detalle de Pago",
          headerShown: true,
        }}
      />
      <ScreenContainer>
        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#369BC9" />
            <Text style={styles.stateText}>Cargando detalle de pago...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>Regresar a Mis Pagos</Text>
            </TouchableOpacity>
          </View>
        ) : !detail ? (
          <View style={styles.errorState}>
            <Ionicons name="document-text-outline" size={48} color="#6B7280" />
            <Text style={styles.errorText}>No se encontró información de este pago.</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>Regresar a Mis Pagos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
            {/* Tarjeta Cabecera */}
            <View style={styles.headerCard}>
              <View style={styles.headerInfo}>
                <Text style={styles.companyName}>{detail.company_name}</Text>
                <Text style={styles.periodText}>{formatPeriod(detail.period)}</Text>
                <Text style={styles.dateText}>
                  Pagado el: {formatDate(detail.paid_at)}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusDetails(detail.status).bg },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: getStatusDetails(detail.status).text },
                  ]}
                >
                  {getStatusDetails(detail.status).label}
                </Text>
              </View>
            </View>

            {/* Detalles de Empleado y Contrato */}
            <View style={styles.detailsCard}>
              <Text style={styles.cardTitle}>Datos Laborales</Text>
              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.itemLabel}>Nombre Afiliado</Text>
                  <Text style={styles.itemValue}>{detail.affiliate_name}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.itemLabel}>Identificación</Text>
                  <Text style={styles.itemValue}>{detail.document}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.itemLabel}>Cargo</Text>
                  <Text style={styles.itemValue}>{detail.position}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.itemLabel}>Días Cotizados</Text>
                  <Text style={styles.itemValue}>{detail.days_contributed} días</Text>
                </View>
              </View>
            </View>

            {/* Desglose Salarial */}
            <Text style={styles.sectionTitle}>Desglose del Pago</Text>
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Salario Bruto (IBC)</Text>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(detail.base_salary)}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Tu deducción (Pensión 4%)</Text>
                <Text style={[styles.breakdownValue, styles.deductionText]}>
                  - {formatCurrency(detail.employee_pension_deduction)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.netRow}>
                <Text style={styles.netLabel}>Neto Recibido (Transferido)</Text>
                <Text style={styles.netValue}>
                  {formatCurrency(detail.net_salary)}
                </Text>
              </View>
            </View>

            {/* Aportes al Fondo de Pensión */}
            <Text style={styles.sectionTitle}>Aportes Pensionales (BreazeLife S.A.)</Text>
            <View style={styles.pensionCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Tu deducción (4%)</Text>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(detail.employee_pension_deduction)}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Aporte Empresa (12%)</Text>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(detail.employer_pension_contrib)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalPensionRow}>
                <Text style={styles.totalPensionLabel}>Total Cotizado (16% IBC)</Text>
                <Text style={styles.totalPensionValue}>
                  {formatCurrency(detail.total_pension_contrib)}
                </Text>
              </View>
            </View>

            {/* Información de Cotización Relacionada */}
            <Text style={styles.sectionTitle}>Estado del Aporte</Text>
            <View style={styles.quoteCard}>
              <View style={styles.quoteRow}>
                <View style={styles.quoteHeader}>
                  <Text style={styles.quoteRef}>Ref: {detail.quote_id || "Sin ID"}</Text>
                  <Text style={styles.quoteSubText}>
                    Planilla de cotización pensional en BreazeLife S.A.
                  </Text>
                </View>
                <View
                  style={[
                    styles.quoteStatusBadge,
                    { backgroundColor: getQuoteStatusDetails(detail.quote_status).bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.quoteStatusText,
                      { color: getQuoteStatusDetails(detail.quote_status).text },
                    ]}
                  >
                    {getQuoteStatusDetails(detail.quote_status).label}
                  </Text>
                </View>
              </View>
              {detail.quote_status === "PENDING" && (
                <View style={styles.quoteTip}>
                  <Ionicons name="information-circle-outline" size={16} color="#B45309" />
                  <Text style={styles.quoteTipText}>
                    El aporte pensional del 16% está pendiente de aprobación por el administrador de BreazeLife. Tu saldo pensional se actualizará al aprobarse.
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.backBtnBottom} onPress={() => router.back()}>
              <Text style={styles.backBtnBottomText}>Regresar a Mis Pagos</Text>
            </TouchableOpacity>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        )}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  periodText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
    textTransform: "capitalize",
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
  },
  gridItem: {
    width: "50%",
  },
  itemLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
    marginTop: 8,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  breakdownLabel: {
    fontSize: 13,
    color: "#4B5563",
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  deductionText: {
    color: "#EF4444",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  netRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  netValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#16A34A",
  },
  pensionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  totalPensionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalPensionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  totalPensionValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2563EB",
  },
  quoteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quoteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quoteHeader: {
    flex: 1,
  },
  quoteRef: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  quoteSubText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  quoteStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quoteStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  quoteTip: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  quoteTipText: {
    flex: 1,
    fontSize: 11,
    color: "#B45309",
    lineHeight: 16,
  },
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: "#6B7280",
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    lineHeight: 20,
  },
  backBtn: {
    backgroundColor: "#369BC9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  backBtnBottom: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#369BC9",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  backBtnBottomText: {
    color: "#369BC9",
    fontSize: 15,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 40,
  },
});
