import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { QuoteResponseDto } from "@/src/dtos/affiliate/affiliate.dtos";
export const QuoteCard = ({ quote }: { quote: QuoteResponseDto }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // Configuración visual según el estado
  const getStatusStyle = () => {
    switch (quote.status) {
      case 'ACCEPTED': return { bg: '#dcfce3', text: '#166534', label: 'APROBADA' };
      case 'PENDING': return { bg: '#fef08a', text: '#854d0e', label: 'PENDIENTE' };
      case 'REJECTED': return { bg: '#fee2e2', text: '#991b1b', label: 'RECHAZADA' };
      default: return { bg: '#e2e8f0', text: '#475569', label: quote.status };
    }
  };
  const statusStyle = getStatusStyle();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>
          Fecha: {new Date(quote.contribDate).toLocaleDateString('es-ES')}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
        </View>
      </View>

      <Text style={styles.idText}>Ref: {quote.quoteId}</Text>
      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Días Cotizados:</Text>
        <Text style={styles.valueText}>{quote.daysContributed} días</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Tu Aporte:</Text>
        <Text style={styles.valueText}>{formatCurrency(quote.affiliateContrib)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Aporte Empresa:</Text>
        <Text style={styles.valueText}>{formatCurrency(quote.employerContrib)}</Text>
      </View>

      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total Cotizado (16%)</Text>
        <Text style={styles.totalValue}>{formatCurrency(quote.totalContrib)}</Text>
      </View>

      {/* Si fue rechazada y tiene comentario, lo mostramos */}
      {quote.status === 'REJECTED' && quote.comment && (
        <Text style={styles.errorText}>Motivo: {quote.comment}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  dateText: { fontWeight: "bold", color: "#1e293b" },
  idText: { color: "#94a3b8", fontSize: 11, marginBottom: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "#64748b" },
  valueText: { fontWeight: "600", color: "#334155" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 12 },
  totalBox: { backgroundColor: "#f8fafc", padding: 12, borderRadius: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  totalLabel: { fontWeight: "bold", color: "#475569" },
  totalValue: { fontWeight: "bold", color: "#2563eb", fontSize: 16 },
  errorText: { color: "#dc2626", fontSize: 12, marginTop: 10, fontStyle: "italic" }
});