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
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import { getPayrollDetail } from "@/src/services/api/payrollService";
import type { PayrollDetailDataDto } from "@/src/dtos/employer/employer.dtos";
import { formatCurrency, formatPeriod, formatDate } from "@/src/utils/formatters";
import PayrollEmployeeCard from "@/src/components/employer/payrollEmployeeCard";

export default function EmployerPayrollDetailScreen() {
  const router = useRouter();
  const { payrollId } = useLocalSearchParams<{ payrollId: string }>();

  const [detail, setDetail] = useState<PayrollDetailDataDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!payrollId) {
      setError("Falta el identificador de la nómina.");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPayrollDetail(payrollId);
        setDetail(res.data);
      } catch (err) {
        setError("No se pudo cargar el detalle de la nómina. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [payrollId]);

  return (
    <>
      <Stack.Screen
        options={{
          title: detail ? `Nómina ${formatPeriod(detail.period)}` : "Detalle de Nómina",
          headerShown: true,
        }}
      />
      <ScreenContainer>
        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#369BC9" />
            <Text style={styles.stateText}>Cargando detalle de nómina...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>Regresar al Historial</Text>
            </TouchableOpacity>
          </View>
        ) : !detail ? (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>No se encontró información de la nómina.</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>Regresar al Historial</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
            {/* Cabecera */}
            <View style={styles.headerCard}>
              <View style={styles.headerInfo}>
                <Text style={styles.companyName}>{detail.company_name}</Text>
                <Text style={styles.periodText}>{formatPeriod(detail.period)}</Text>
                <Text style={styles.dateText}>
                  Ejecutado: {formatDate(detail.executed_at)}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  detail.status === "PROCESSED"
                    ? styles.badgeProcessed
                    : styles.badgePending,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    detail.status === "PROCESSED"
                      ? styles.textProcessed
                      : styles.textPending,
                  ]}
                >
                  {detail.status === "PROCESSED" ? "Procesada" : detail.status}
                </Text>
              </View>
            </View>

            {/* Totales consolidados */}
            <Text style={styles.sectionTitle}>Totales de la Operación</Text>
            <View style={styles.totalsCard}>
              <View style={styles.totalsGrid}>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Empleados Pagados</Text>
                  <Text style={styles.totalValue}>{detail.totals.total_employees}</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Total Bruto</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(detail.totals.total_gross_salary)}
                  </Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Deducción Pensión</Text>
                  <Text style={[styles.totalValue, styles.deductionText]}>
                    - {formatCurrency(detail.totals.total_employee_pension_deduction)}
                  </Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Salario Neto Transferido</Text>
                  <Text style={[styles.totalValue, styles.netText]}>
                    {formatCurrency(detail.totals.total_net_salary)}
                  </Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Aporte Patronal Pensión</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(detail.totals.total_employer_pension_contrib)}
                  </Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Total Cotizado Pensión</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(detail.totals.total_pension_contrib)}
                  </Text>
                </View>
              </View>
              <View style={styles.totalsFooter}>
                <Text style={styles.footerLabel}>Total Débito de Fondos</Text>
                <Text style={styles.footerValue}>
                  {formatCurrency(detail.totals.total_debit)}
                </Text>
              </View>
            </View>

            {/* Desglose de pagos */}
            <Text style={styles.sectionTitle}>
              Desglose de Pagos ({detail.payments.length})
            </Text>

            {detail.payments.map((payment) => (
              <PayrollEmployeeCard key={payment.payment_id} data={payment} />
            ))}

            <TouchableOpacity style={styles.backBtnBottom} onPress={() => router.back()}>
              <Text style={styles.backBtnBottomText}>Regresar al Historial</Text>
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
    paddingHorizontal: 4,
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
  badgeProcessed: {
    backgroundColor: "#D1FAE5",
  },
  badgePending: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  textProcessed: {
    color: "#065F46",
  },
  textPending: {
    color: "#92400E",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  totalsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  totalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 14,
    columnGap: 16,
  },
  totalItem: {
    width: "47%",
  },
  totalLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  deductionText: {
    color: "#EF4444",
  },
  netText: {
    color: "#16A34A",
  },
  totalsFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  footerValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#369BC9",
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  empHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#369BC9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  empInfo: {
    flex: 1,
  },
  empName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  empPosition: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailItem: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  quoteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quoteInfo: {
    flex: 1,
  },
  quoteLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  quoteValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
  },
  quoteStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  quoteStatusText: {
    fontSize: 10,
    fontWeight: "600",
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
    marginTop: 16,
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
