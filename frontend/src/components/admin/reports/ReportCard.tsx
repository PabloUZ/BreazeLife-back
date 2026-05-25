import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import type { ReportDownloadStatus } from "@/src/hooks/useAdminReports";
import type { ReportParams } from "@/src/services/api/adminReportService";

interface Props {
  title: string;
  description: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  requiresDates: boolean;
  status: ReportDownloadStatus;
  onDownload: (params?: Partial<ReportParams>) => void;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function ReportCard({
  title,
  description,
  icon,
  iconColor,
  iconBg,
  requiresDates,
  status,
  onDownload,
}: Props) {
  const [fromDate, setFromDate] = useState<Date>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const isDownloading = status === "downloading";
  const isDone = status === "done";
  const isError = status === "error";

  const handleDownload = () => {
    if (requiresDates) {
      onDownload({ from: toISODate(fromDate), to: toISODate(toDate) });
    } else {
      onDownload();
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      {/* Date pickers */}
      {requiresDates && (
        <View style={styles.datesSection}>
          <Text style={styles.datesLabel}>Rango de fechas</Text>
          <View style={styles.datesRow}>
            {/* Desde */}
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowFromPicker(true)}
              disabled={isDownloading}
            >
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <View>
                <Text style={styles.dateButtonLabel}>Desde</Text>
                <Text style={styles.dateButtonValue}>{formatDateDisplay(fromDate)}</Text>
              </View>
            </TouchableOpacity>

            <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />

            {/* Hasta */}
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowToPicker(true)}
              disabled={isDownloading}
            >
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <View>
                <Text style={styles.dateButtonLabel}>Hasta</Text>
                <Text style={styles.dateButtonValue}>{formatDateDisplay(toDate)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {showFromPicker && (
            <DateTimePicker
              value={fromDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={toDate}
              onChange={(_, date) => {
                setShowFromPicker(false);
                if (date) setFromDate(date);
              }}
            />
          )}

          {showToPicker && (
            <DateTimePicker
              value={toDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={fromDate}
              maximumDate={new Date()}
              onChange={(_, date) => {
                setShowToPicker(false);
                if (date) setToDate(date);
              }}
            />
          )}
        </View>
      )}

      {/* Download button */}
      <TouchableOpacity
        style={[
          styles.downloadButton,
          isDownloading && styles.downloadButtonDisabled,
          isDone && styles.downloadButtonDone,
          isError && styles.downloadButtonError,
        ]}
        onPress={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Generando PDF...</Text>
          </>
        ) : isDone ? (
          <>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>PDF listo</Text>
          </>
        ) : isError ? (
          <>
            <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Error — Reintentar</Text>
          </>
        ) : (
          <>
            <Ionicons name="download-outline" size={18} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Descargar PDF</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 17,
  },
  datesSection: {
    gap: 8,
  },
  datesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  datesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dateButtonLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  dateButtonValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  downloadButton: {
    backgroundColor: "#369BC9",
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  downloadButtonDisabled: {
    opacity: 0.7,
  },
  downloadButtonDone: {
    backgroundColor: "#10B981",
  },
  downloadButtonError: {
    backgroundColor: "#EF4444",
  },
  downloadButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

