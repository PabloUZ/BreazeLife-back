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
  const [showPicker, setShowPicker] = useState<"from" | "to" | null>(null);

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === "android") {
      setShowPicker(null);
      if (event.type === "set" && selectedDate) {
        let newFrom = fromDate;
        let newTo = toDate;
        if (showPicker === "from") { setFromDate(selectedDate); newFrom = selectedDate; }
        if (showPicker === "to") { setToDate(selectedDate); newTo = selectedDate; }
        const fromIso = newFrom ? newFrom.toISOString().split("T")[0] : undefined;
        const toIso = newTo ? newTo.toISOString().split("T")[0] : undefined;
        onApply(fromIso, toIso);
      }
    } else {
      if (selectedDate) {
        if (showPicker === "from") setFromDate(selectedDate);
        if (showPicker === "to") setToDate(selectedDate);
      }
    }
  }

  function handleIosConfirm() {
    setShowPicker(null);
    const fromIso = fromDate ? fromDate.toISOString().split("T")[0] : undefined;
    const toIso = toDate ? toDate.toISOString().split("T")[0] : undefined;
    onApply(fromIso, toIso);
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

  const activeFrom = showPicker === "from";
  const activeTo = showPicker === "to";

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="filter-outline" size={14} color="#369BC9" />
          <Text style={styles.label}>Filtrar por fecha</Text>
        </View>
        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.clearLink}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        {/* Desde */}
        <TouchableOpacity
          style={[styles.dateBtn, activeFrom && styles.dateBtnActive]}
          onPress={() => setShowPicker("from")}
          activeOpacity={0.8}
        >
          <View style={styles.dateBtnInner}>
            <Text style={styles.subLabel}>Desde</Text>
            <View style={styles.dateBtnValue}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={activeFrom ? "#369BC9" : "#9CA3AF"}
              />
              <Text style={[styles.dateText, !fromDate && styles.dateTextPlaceholder]}>
                {formatDate(fromDate)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Ionicons name="arrow-forward" size={12} color="#D1D5DB" />
          <View style={styles.separatorLine} />
        </View>

        {/* Hasta */}
        <TouchableOpacity
          style={[styles.dateBtn, activeTo && styles.dateBtnActive]}
          onPress={() => setShowPicker("to")}
          activeOpacity={0.8}
        >
          <View style={styles.dateBtnInner}>
            <Text style={styles.subLabel}>Hasta</Text>
            <View style={styles.dateBtnValue}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={activeTo ? "#369BC9" : "#9CA3AF"}
              />
              <Text style={[styles.dateText, !toDate && styles.dateTextPlaceholder]}>
                {formatDate(toDate)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={(showPicker === "from" ? fromDate : toDate) || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
          themeVariant="light"
          textColor="#000000"
        />
      )}

      {Platform.OS === "ios" && showPicker && (
        <TouchableOpacity style={styles.iosDoneBtn} onPress={handleIosConfirm} activeOpacity={0.8}>
          <Text style={styles.iosDoneText}>Confirmar fecha</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAFA",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    letterSpacing: 0.2,
  },
  clearLink: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  dateBtnActive: {
    borderColor: "#369BC9",
    backgroundColor: "#EFF6FF",
  },
  dateBtnInner: {
    gap: 3,
  },
  dateBtnValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  subLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dateText: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },
  dateTextPlaceholder: {
    color: "#9CA3AF",
    fontWeight: "400",
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  separatorLine: {
    width: 4,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  iosDoneBtn: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 11,
    backgroundColor: "#369BC9",
    borderRadius: 10,
  },
  iosDoneText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});