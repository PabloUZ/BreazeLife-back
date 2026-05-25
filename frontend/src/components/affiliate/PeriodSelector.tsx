import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";

interface PeriodSelectorProps {
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
  // Opcional: Si tienes el año de afiliación en tu AuthContext, se lo pasas aquí
  affiliationYear?: number; 
}

const MONTHS = [
  { label: "Ene", value: "01" }, { label: "Feb", value: "02" }, { label: "Mar", value: "03" },
  { label: "Abr", value: "04" }, { label: "May", value: "05" }, { label: "Jun", value: "06" },
  { label: "Jul", value: "07" }, { label: "Ago", value: "08" }, { label: "Sep", value: "09" },
  { label: "Oct", value: "10" }, { label: "Nov", value: "11" }, { label: "Dic", value: "12" }
];

export const PeriodSelector = ({ selectedPeriod, onSelectPeriod, affiliationYear }: PeriodSelectorProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const currentYear = new Date().getFullYear();
  // Si no le pasamos el año de afiliación, por defecto muestra 10 años hacia atrás
  const oldestYear = affiliationYear || (currentYear - 10); 
  const totalYears = currentYear - oldestYear + 1;
  
  const years = Array.from({ length: totalYears }, (_, i) => (currentYear - i).toString());

  const initialYear = selectedPeriod ? selectedPeriod.split("-")[0] : currentYear.toString();
  const initialMonth = selectedPeriod ? selectedPeriod.split("-")[1] : "";
  
  const [tempYear, setTempYear] = useState(initialYear);
  const [tempMonth, setTempMonth] = useState(initialMonth);

  const handleApply = () => {
    if (tempYear && tempMonth) {
      onSelectPeriod(`${tempYear}-${tempMonth}`);
    }
    setModalVisible(false);
  };

  const handleClear = () => {
    onSelectPeriod("");
    setTempMonth("");
    setModalVisible(false);
  };

  const getDisplayText = () => {
    if (!selectedPeriod) return "Todos los periodos";
    const [y, m] = selectedPeriod.split("-");
    const monthObj = MONTHS.find(mon => mon.value === m);
    return `Filtrando: ${monthObj?.label} ${y}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.triggerButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.triggerText}>{getDisplayText()}</Text>
        <Text style={styles.triggerIcon}>▼</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Periodo</Text>

            {/* Selector de Años (AHORA ES SCROLLABLE) */}
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

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <Text style={styles.clearButtonText}>Ver Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.applyButton, !tempMonth && styles.applyButtonDisabled]} 
                onPress={handleApply}
                disabled={!tempMonth}
              >
                <Text style={styles.applyButtonText}>Aplicar Filtro</Text>
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
  triggerText: { color: "#334155", fontWeight: "bold", fontSize: 16 },
  triggerIcon: { color: "#64748b", fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#ffffff", borderRadius: 16, padding: 20, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 16, textAlign: "center" },
  sectionLabel: { fontSize: 14, fontWeight: "bold", color: "#64748b", marginTop: 10, marginBottom: 8 },
  
  // Nuevos estilos para el ScrollView de años
  yearsContainer: { marginBottom: 10, height: 45 },
  yearChip: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#f1f5f9", borderRadius: 8, marginRight: 8, alignItems: "center", justifyContent: "center" },
  
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridChip: { width: "23%", paddingVertical: 10, backgroundColor: "#f1f5f9", borderRadius: 8, marginBottom: 8, alignItems: "center" },
  
  chipActive: { backgroundColor: "#2563eb" },
  chipText: { color: "#475569", fontWeight: "600" },
  chipTextActive: { color: "#ffffff" },
  actionButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  clearButton: { flex: 1, padding: 14, alignItems: "center", marginRight: 8 },
  clearButtonText: { color: "#ef4444", fontWeight: "bold" },
  applyButton: { flex: 2, padding: 14, backgroundColor: "#2563eb", borderRadius: 8, alignItems: "center" },
  applyButtonDisabled: { backgroundColor: "#93c5fd" },
  applyButtonText: { color: "#ffffff", fontWeight: "bold" },
});