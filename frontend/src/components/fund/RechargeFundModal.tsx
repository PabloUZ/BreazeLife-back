import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import type { FundDto, FundType } from "@/src/dtos/fund/fund.dto";
import { rechargeFund } from "@/src/services/api/fundService";

type Props = {
  visible: boolean;
  employerId: string;
  fund: FundDto | null;
  onClose: () => void;
  onSuccess: (updatedFund: FundDto) => void;
};

const FUND_LABELS: Record<FundType, string> = {
  PAYROLL: "Fondo de nómina",
  PENSION: "Fondo de aportes",
};

export default function RechargeFundModal({
  visible,
  employerId,
  fund,
  onClose,
  onSuccess,
}: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setAmount("");
    setError(null);
    onClose();
  }

  async function handleConfirm() {
    Keyboard.dismiss(); // Ocultamos el teclado al confirmar
    const parsed = parseFloat(amount.replace(/,/g, ""));
    if (!fund || isNaN(parsed) || parsed <= 0) {
      setError("Ingresa un monto válido mayor a 0.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updated = await rechargeFund(employerId, fund.type, {
        amount: parsed,
      });
      onSuccess(updated);
      handleClose();
    } catch {
      setError("No se pudo realizar la recarga. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (!fund) return null;

  const formatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(fund.balance);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardContainer}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.sheet}>
                <View style={styles.handle} />

                <Text style={styles.title}>Recargar fondo</Text>
                <Text style={styles.fundName}>{FUND_LABELS[fund.type]}</Text>

                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Saldo actual</Text>
                  <Text style={styles.balanceValue}>{formatted}</Text>
                </View>

                <Text style={styles.inputLabel}>Monto a recargar (COP)</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={(v) => {
                    setError(null);
                    setAmount(v);
                  }}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss} // Oculta el teclado con la tecla "Enter/Listo"
                />

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.btnPrimary, loading && styles.btnDisabled]}
                  onPress={handleConfirm}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Confirmar recarga</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={handleClose}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  keyboardContainer: {
    width: "100%",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  fundName: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  inputLabel: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#111827",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: "#EF4444",
    marginBottom: 12,
  },
  btnPrimary: {
    backgroundColor: "#369BC9",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
    marginTop: 8,
  },
  btnDisabled: {
    backgroundColor: "#93C5FD",
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  btnSecondary: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  btnSecondaryText: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 15,
  },
});