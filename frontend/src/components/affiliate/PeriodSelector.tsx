import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";

interface PeriodSelectorProps {
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
  affiliationYear?: number;
  showStatusFilter?: boolean;
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
}

const MONTHS = [
  { label: "Ene", value: "01" }, { label: "Feb", value: "02" }, { label: "Mar", value: "03" },
  { label: "Abr", value: "04" }, { label: "May", value: "05" }, { label: "Jun", value: "06" },
  { label: "Jul", value: "07" }, { label: "Ago", value: "08" }, { label: "Sep", value: "09" },
  { label: "Oct", value: "10" }, { label: "Nov", value: "11" }, { label: "Dic", value: "12" }
];

const STATUS_OPTIONS = [
  { label: "Pendientes", value: "PENDING" },
  { label: "Aprobadas", value: "ACCEPTED" },
  { label: "Rechazadas", value: "REJECTED" },
];

export const PeriodSelector = ({
  selectedPeriod,
  onSelectPeriod,
  affiliationYear,
  showStatusFilter,
  selectedStatus,
  onSelectStatus
}: PeriodSelectorProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Lógica de Años
  const currentYear = new Date().getFullYear();
  const oldestYear = affiliationYear || (currentYear - 10);
  const totalYears = Math.max(1, currentYear - oldestYear + 1);
  const years = Array.from({ length: totalYears }, (_, i) => (currentYear - i).toString());

  // Estados Iniciales
  const initialYear = selectedPeriod ? selectedPeriod.split("-")[0] : currentYear.toString();
  const initialMonth = selectedPeriod ? selectedPeriod.split("-")[1] : "";

  // Estados Temporales del Modal
  const [tempYear, setTempYear] = useState(initialYear);
  const [tempMonth, setTempMonth] = useState(initialMonth);
  const [tempStatus, setTempStatus] = useState(selectedStatus || "");

  const handleApply = () => {
    if (tempYear && tempMonth) {
      onSelectPeriod(`${tempYear}-${tempMonth}`);
    }
    if (showStatusFilter && onSelectStatus) {
      onSelectStatus(tempStatus);
    }
    setModalVisible(false);
  };

  const handleClear = () => {
    onSelectPeriod("");
    setTempMonth("");
    setTempStatus("");
    if (onSelectStatus) onSelectStatus("");
    setModalVisible(false);
  };

  // Texto dinámico para el botón principal
  const getDisplayText = () => {
    let text = "Todos los periodos";
    
    if (selectedPeriod) {
      const [y, m] = selectedPeriod.split("-");
      const monthObj = MONTHS.find(mon => mon.value === m);
      text = `${monthObj?.label || ''} ${y}`;
    }

    if (showStatusFilter && selectedStatus) {
      const statusObj = STATUS_OPTIONS.find(s => s.value === selectedStatus);
      text += ` | ${statusObj?.label || selectedStatus}`;
    }
    
    return text;
  };

  return (
    <View style={styles.container}>
      {/* Botón Trigger */}
      <TouchableOpacity style={styles.triggerButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.triggerText} numberOfLines={1}>{getDisplayText()}</Text>
        <Text style={styles.triggerIcon}>▼</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtros de Búsqueda</Text>

            {/* Selector de Años */}
            <Text style={styles.sectionLabel}>Año</Text>
            <View style={styles.yearsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {years.map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yearChip, tempYear === y && styles.chipActive]}
                    onPress={() => setTempYear(y)}
                  >
                    <Text style={[styles.chipText, tempYear === y && styles.chipTextActive]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Selector de Meses */}
            <Text style={styles.sectionLabel}>Mes</Text>
            <View style={styles.grid}>
              {MONTHS.map(m => (
                <TouchableOpacity
                  key={m.value}
                  style={[styles.gridChip, tempMonth === m.value && styles.chipActive]}
                  onPress={() => setTempMonth(m.value)}
                >
                  <Text style={[styles.chipText, tempMonth === m.value && styles.chipTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selector de Estados (Condicional) */}
            {showStatusFilter && (
              <>
                <Text style={styles.sectionLabel}>Estado de Cotización</Text>
                <View style={styles.row}>
                  {STATUS_OPTIONS.map(s => (
                    <TouchableOpacity
                      key={s.value}
                      style={[styles.chip, tempStatus === s.value && styles.chipActive]}
                      onPress={() => setTempStatus(s.value)}
                    >
                      <Text style={[styles.chipText, tempStatus === s.value && styles.chipTextActive]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Botones de Acción */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <Text style={styles.clearButtonText}>Limpiar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 15 },
  triggerButton: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#e2e8f0", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  triggerText: { color: "#334155", fontWeight: "bold", fontSize: 16, flex: 1, marginRight: 10 },
  triggerIcon: { color: "#64748b", fontSize: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#ffffff", borderRadius: 16, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 16, textAlign: "center" },
  sectionLabel: { fontSize: 14, fontWeight: "bold", color: "#64748b", marginTop: 10, marginBottom: 8 },
  
  yearsContainer: { marginBottom: 10, height: 45 },
  yearChip: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#f1f5f9", borderRadius: 8, marginRight: 8, alignItems: "center", justifyContent: "center" },
  
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridChip: { width: "23%", paddingVertical: 10, backgroundColor: "#f1f5f9", borderRadius: 8, marginBottom: 8, alignItems: "center" },
  
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  chip: { flex: 1, paddingVertical: 10, backgroundColor: "#f1f5f9", borderRadius: 8, marginHorizontal: 4, alignItems: "center" },
  
  chipActive: { backgroundColor: "#2563eb" },
  chipText: { color: "#475569", fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: "#ffffff" },
  
  actionButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  clearButton: { flex: 1, padding: 14, alignItems: "center", marginRight: 8 },
  clearButtonText: { color: "#ef4444", fontWeight: "bold" },
  applyButton: { flex: 2, padding: 14, backgroundColor: "#2563eb", borderRadius: 8, alignItems: "center" },
  applyButtonText: { color: "#ffffff", fontWeight: "bold" },
});