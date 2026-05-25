import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AffiliatePaymentItemDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { formatCurrency, formatPeriod, formatDate } from "@/src/utils/formatters";

interface PaymentCardProps {
  payment: AffiliatePaymentItemDto;
  onPress: () => void;
}

export const PaymentCard = ({ payment, onPress }: PaymentCardProps) => {
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

  const statusDetails = getStatusDetails(payment.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.periodText}>{formatPeriod(payment.period)}</Text>
          <Text style={styles.companyName}>{payment.company_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusDetails.bg }]}>
          <Text style={[styles.statusText, { color: statusDetails.text }]}>
            {statusDetails.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.body}>
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Cargo</Text>
            <Text style={styles.valueText} numberOfLines={1}>{payment.position}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Salario Base</Text>
            <Text style={styles.valueText}>{formatCurrency(payment.base_salary)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Fecha Pago</Text>
            <Text style={styles.valueText}>
              {payment.paid_at ? formatDate(payment.paid_at).split(",")[0] : ""}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Neto Recibido</Text>
            <Text style={styles.netValue}>{formatCurrency(payment.net_salary)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerActionText}>Ver desglose detallado</Text>
        <Ionicons name="chevron-forward" size={16} color="#369BC9" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  periodText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
    textTransform: "capitalize",
  },
  companyName: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  body: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCol: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  valueText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  netValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16A34A",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 4,
  },
  footerActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#369BC9",
  },
});
