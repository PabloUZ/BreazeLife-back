import { StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "@/src/utils/formatters";

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

export default function PayrollEmployeeCard({ data }: Props) {
  const showDetailFields = data.status !== undefined || data.quote_id !== undefined;

  return (
    <View style={styles.card}>
      <View style={styles.empHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {data.affiliate_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.empInfo}>
          <Text style={styles.empName}>{data.affiliate_name}</Text>
          <Text style={styles.empPosition}>
            {data.position ? `${data.position} · ` : ""}{data.document}
          </Text>
        </View>
        {data.status && (
          <View
            style={[
              styles.statusBadge,
              data.status === "SUCCESS" || data.status === "PROCESSED"
                ? styles.badgeProcessed
                : styles.badgePending,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                data.status === "SUCCESS" || data.status === "PROCESSED"
                  ? styles.textProcessed
                  : styles.textPending,
              ]}
            >
              {data.status === "SUCCESS" || data.status === "PROCESSED"
                ? "Exitoso"
                : data.status}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Detalles financieros */}
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.itemLabel}>Salario Base</Text>
          <Text style={styles.itemValue}>
            {formatCurrency(data.base_salary)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.itemLabel}>Deducción Pensión</Text>
          <Text style={[styles.itemValue, styles.deductionText]}>
            - {formatCurrency(data.employee_pension_deduction)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.itemLabel}>Salario Neto</Text>
          <Text style={[styles.itemValue, styles.netText]}>
            {formatCurrency(data.net_salary)}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.itemLabel}>Contribución Patronal</Text>
          <Text style={styles.itemValue}>
            {formatCurrency(data.employer_pension_contrib)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.itemLabel}>Total Pensión</Text>
          <Text style={styles.itemValue}>
            {formatCurrency(data.total_pension_contrib ?? (data.employer_pension_contrib + data.employee_pension_deduction))}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.itemLabel}>Días Cotizados</Text>
          <Text style={styles.itemValue}>
            {data.days_contributed !== undefined ? `${data.days_contributed} días` : "30 días"}
          </Text>
        </View>
      </View>

      {/* Detalles de la planilla/cotización (solo para el historial/detalle) */}
      {showDetailFields && data.quote_id && (
        <>
          <View style={styles.divider} />
          <View style={styles.quoteRow}>
            <View style={styles.quoteInfo}>
              <Text style={styles.quoteLabel}>ID Cotización de Pensión</Text>
              <Text style={styles.quoteValue}>{data.quote_id}</Text>
            </View>
            {data.quote_status && (
              <View
                style={[
                  styles.quoteStatusBadge,
                  data.quote_status === "PROCESSED" || data.quote_status === "ACCEPTED"
                    ? styles.badgeProcessed
                    : styles.badgePending,
                ]}
              >
                <Text
                  style={[
                    styles.quoteStatusText,
                    data.quote_status === "PROCESSED" || data.quote_status === "ACCEPTED"
                      ? styles.textProcessed
                      : styles.textPending,
                  ]}
                >
                  {data.quote_status === "PROCESSED" || data.quote_status === "ACCEPTED"
                    ? "Procesada"
                    : data.quote_status}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  badgeProcessed: {
    backgroundColor: "#D1FAE5",
  },
  badgePending: {
    backgroundColor: "#FEF3C7",
  },
  textProcessed: {
    color: "#065F46",
  },
  textPending: {
    color: "#92400E",
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
  deductionText: {
    color: "#EF4444",
  },
  netText: {
    color: "#16A34A",
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
});
