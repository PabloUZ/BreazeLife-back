import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { PayslipDto } from "@/src/dtos/affiliate/affiliate.dtos";

export const PayslipCard = ({ payslip }: { payslip: PayslipDto }) => {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(amount || 0);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>Periodo: {payslip.period}</Text>
        {/* Usamos el status como etiqueta, ya que no hay un ID de colilla */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{payslip.status}</Text>
        </View>
      </View>
      
      <View style={styles.salaryRow}>
        <Text style={styles.label}>Salario Bruto:</Text>
        <Text style={styles.grossValue}>{formatCurrency(payslip.grossSalary)}</Text>
      </View>
      <View style={styles.salaryRow}>
        <Text style={styles.label}>Salario Neto (Recibido):</Text>
        <Text style={styles.netValue}>{formatCurrency(payslip.netSalaryReceived)}</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Detalle de Aportes</Text>
      <View style={styles.salaryRow}>
        <Text style={styles.label}>Tu deducción (Pensión 4%):</Text>
        <Text style={styles.valueText}>{formatCurrency(payslip.pensionDeduction)}</Text>
      </View>
      <View style={styles.salaryRow}>
        <Text style={styles.label}>Aporte Empresa:</Text>
        <Text style={styles.valueText}>{formatCurrency(payslip.employerContrib)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  dateText: { fontWeight: "bold", color: "#1e293b", textTransform: "capitalize" },
  statusBadge: { backgroundColor: "#dcfce3", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#166534", fontSize: 10, fontWeight: "bold" },
  salaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "#64748b" },
  grossValue: { fontWeight: "bold", color: "#475569" },
  netValue: { fontWeight: "bold", color: "#16a34a", fontSize: 16 },
  valueText: { fontWeight: "600", color: "#334155" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 12 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 },
});