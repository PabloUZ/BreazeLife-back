import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  isApplying: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RATES = [
  { type: "CONSERVATIVE", label: "Conservador", rate: "0.4%", color: "#3B82F6" },
  { type: "MODERATE", label: "Moderado", rate: "0.6%", color: "#F59E0B" },
  { type: "RISKY", label: "Mayor riesgo", rate: "0.8%", color: "#EF4444" },
];

export default function ApplyProfitabilityModal({
  visible,
  isApplying,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="trending-up" size={28} color="#10B981" />
            </View>
            <Text style={styles.title}>Aplicar rentabilidad mensual</Text>
            <Text style={styles.subtitle}>
              Este proceso actualizará el saldo de{" "}
              <Text style={styles.bold}>todos los afiliados</Text> según la tasa
              de su tipo de fondo.
            </Text>
          </View>

          {/* Tasas */}
          <View style={styles.ratesContainer}>
            <Text style={styles.ratesTitle}>Tasas a aplicar</Text>
            {RATES.map((r) => (
              <View key={r.type} style={styles.rateRow}>
                <View style={[styles.rateDot, { backgroundColor: r.color }]} />
                <Text style={styles.rateLabel}>{r.label}</Text>
                <Text style={[styles.rateValue, { color: r.color }]}>
                  {r.rate}
                </Text>
              </View>
            ))}
          </View>

          {/* Advertencia */}
          <View style={styles.warning}>
            <Ionicons name="alert-circle-outline" size={16} color="#F59E0B" />
            <Text style={styles.warningText}>
              Solo puede ejecutarse una vez por mes. Esta acción no se puede
              deshacer.
            </Text>
          </View>

          {/* Botones */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isApplying}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, isApplying && styles.buttonDisabled]}
              onPress={onConfirm}
              disabled={isApplying}
            >
              {isApplying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmText}>Aplicar ahora</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    gap: 20,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "600",
    color: "#374151",
  },
  ratesContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  ratesTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rateLabel: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  rateValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  warning: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

