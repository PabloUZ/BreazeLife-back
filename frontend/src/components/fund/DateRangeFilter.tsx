// src/components/fund/DateRangeFilter.tsx
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onApply: (from: string | undefined, to: string | undefined) => void;
};

export default function DateRangeFilter({ onApply }: Props) {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  
  // Control de visibilidad del picker
  const [showPicker, setShowPicker] = useState<"from" | "to" | null>(null);

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === "android") {
      setShowPicker(null);
      
      // En Android, cuando el usuario da clic en aceptar
      if (event.type === "set" && selectedDate) {
        let newFrom = fromDate;
        let newTo = toDate;

        if (showPicker === "from") {
          setFromDate(selectedDate);
          newFrom = selectedDate;
        }
        if (showPicker === "to") {
          setToDate(selectedDate);
          newTo = selectedDate;
        }

        const fromIso = newFrom ? newFrom.toISOString().split("T")[0] : undefined;
        const toIso = newTo ? newTo.toISOString().split("T")[0] : undefined;
        onApply(fromIso, toIso);
      }
    } else {
      // En iOS, SOLO actualizamos el estado en pantalla mientras gira la rueda,
      // NO llamamos a la API aun
      if (selectedDate) {
        if (showPicker === "from") setFromDate(selectedDate);
        if (showPicker === "to") setToDate(selectedDate);
      }
    }
  }

  // confirmar fecha en iOS
  function handleIosConfirm() {
    setShowPicker(null);
    const fromIso = fromDate ? fromDate.toISOString().split("T")[0] : undefined;
    const toIso = toDate ? toDate.toISOString().split("T")[0] : undefined;
    onApply(fromIso, toIso); // aqui se se dispara la API una sola vez
  }

  function handleClear() {
    setFromDate(undefined);
    const today = new Date();
    setToDate(today);
    onApply(undefined, today.toISOString().split("T")[0]);
  }

  function formatDate(date?: Date) {
    if (!date) return "Seleccionar";
    return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Filtrar por fecha</Text>
      
      <View style={styles.row}>
        <View style={styles.dateInputContainer}>
          <Text style={styles.subLabel}>Desde:</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker("from")}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.dateText}>{formatDate(fromDate)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateInputContainer}>
          <Text style={styles.subLabel}>Hasta:</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker("to")}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.dateText}>{formatDate(toDate)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Renderizamos el picker nativo si showPicker no es nulo */}
      {showPicker && (
        <DateTimePicker
          value={(showPicker === "from" ? fromDate : toDate) || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()} // No fechas futuras
          themeVariant="light"
          textColor="#000000"
        />
      )}

      {/* boton en iOS para cerrar el spinner y aplicar de verdad */}
      {Platform.OS === "ios" && showPicker && (
        <TouchableOpacity style={styles.iosDoneBtn} onPress={handleIosConfirm}>
          <Text style={styles.iosDoneText}>Aplicar Filtro</Text>
        </TouchableOpacity>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>Limpiar fechas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 12 },
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  dateInputContainer: { flex: 1 },
  subLabel: { fontSize: 11, color: "#6B7280", marginBottom: 4 },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  dateText: { fontSize: 13, color: "#111827" },
  iosDoneBtn: { alignItems: "center", padding: 10, backgroundColor: "#F3F4F6", borderRadius: 8, marginBottom: 16 },
  iosDoneText: { color: "#369BC9", fontWeight: "600", fontSize: 14 },
  actionsRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 4 },
  clearBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: "#F3F4F6" },
  clearBtnText: { color: "#6B7280", fontWeight: "600", fontSize: 13 },
});