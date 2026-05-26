import { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import { colors, formStyles, radius, spacing, typography } from "@/src/theme";

interface PeriodSelectorProps {
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
  affiliationYear?: number;
  showStatusFilter?: boolean;
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
}

const MONTHS = [
  { label: "Ene", value: "01" },
  { label: "Feb", value: "02" },
  { label: "Mar", value: "03" },
  { label: "Abr", value: "04" },
  { label: "May", value: "05" },
  { label: "Jun", value: "06" },
  { label: "Jul", value: "07" },
  { label: "Ago", value: "08" },
  { label: "Sep", value: "09" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dic", value: "12" },
];

const STATUS_OPTIONS = [
  { label: "Pendientes", value: "PENDING" },
  { label: "Aprobadas", value: "ACCEPTED" },
  { label: "Rechazadas", value: "REJECTED" },
];

export function PeriodSelector({
  selectedPeriod,
  onSelectPeriod,
  affiliationYear,
  showStatusFilter,
  selectedStatus,
  onSelectStatus,
}: PeriodSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const currentYear = new Date().getFullYear();
  const oldestYear = affiliationYear || currentYear - 10;
  const years = useMemo(
    () =>
      Array.from(
        { length: Math.max(1, currentYear - oldestYear + 1) },
        (_, index) => (currentYear - index).toString()
      ),
    [currentYear, oldestYear]
  );

  const initialYear = selectedPeriod ? selectedPeriod.split("-")[0] : currentYear.toString();
  const initialMonth = selectedPeriod ? selectedPeriod.split("-")[1] : "";

  const [tempYear, setTempYear] = useState(initialYear);
  const [tempMonth, setTempMonth] = useState(initialMonth);
  const [tempStatus, setTempStatus] = useState(selectedStatus || "");

  function handleApply() {
    if (tempYear && tempMonth) {
      onSelectPeriod(`${tempYear}-${tempMonth}`);
    }

    if (showStatusFilter && onSelectStatus) {
      onSelectStatus(tempStatus);
    }

    setModalVisible(false);
  }

  function handleClear() {
    onSelectPeriod("");
    setTempMonth("");
    setTempStatus("");
    if (onSelectStatus) {
      onSelectStatus("");
    }
    setModalVisible(false);
  }

  function getDisplayText() {
    let text = "Todos los periodos";

    if (selectedPeriod) {
      const [year, month] = selectedPeriod.split("-");
      const selectedMonth = MONTHS.find((item) => item.value === month);
      text = `${selectedMonth?.label || ""} ${year}`.trim();
    }

    if (showStatusFilter && selectedStatus) {
      const selectedOption = STATUS_OPTIONS.find(
        (option) => option.value === selectedStatus
      );
      text += ` | ${selectedOption?.label || selectedStatus}`;
    }

    return text;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {getDisplayText()}
        </Text>
        <Text style={styles.triggerIcon}>Filtrar</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <AppCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtros de busqueda</Text>

            <Text style={styles.sectionLabel}>Ano</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.yearsRow}
            >
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.chip,
                    tempYear === year ? styles.chipActive : null,
                  ]}
                  onPress={() => setTempYear(year)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      tempYear === year ? styles.chipTextActive : null,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Mes</Text>
            <View style={styles.grid}>
              {MONTHS.map((month) => (
                <TouchableOpacity
                  key={month.value}
                  style={[
                    styles.gridChip,
                    tempMonth === month.value ? styles.chipActive : null,
                  ]}
                  onPress={() => setTempMonth(month.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      tempMonth === month.value ? styles.chipTextActive : null,
                    ]}
                  >
                    {month.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {showStatusFilter ? (
              <>
                <Text style={styles.sectionLabel}>Estado</Text>
                <View style={styles.statusRow}>
                  {STATUS_OPTIONS.map((status) => (
                    <TouchableOpacity
                      key={status.value}
                      style={[
                        styles.statusChip,
                        tempStatus === status.value ? styles.chipActive : null,
                      ]}
                      onPress={() => setTempStatus(status.value)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          tempStatus === status.value ? styles.chipTextActive : null,
                        ]}
                      >
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : null}

            <View style={styles.actions}>
              <AppButton
                title="Limpiar"
                variant="ghost"
                onPress={handleClear}
                style={styles.clearButton}
              />
              <AppButton title="Aplicar" onPress={handleApply} style={styles.applyButton} />
            </View>
          </AppCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  triggerButton: {
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  triggerText: {
    ...typography.bodyStrong,
    color: colors.neutralText,
    flex: 1,
    marginRight: spacing.md,
  },
  triggerIcon: {
    ...typography.caption,
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: spacing.screen,
  },
  modalContent: {
    gap: spacing.md,
  },
  modalTitle: {
    ...typography.sectionTitle,
    color: colors.text,
    textAlign: "center",
  },
  sectionLabel: {
    ...typography.bodyStrong,
    color: colors.textMuted,
  },
  yearsRow: {
    gap: spacing.sm,
  },
  chip: formStyles.chip,
  chipActive: formStyles.chipActive,
  chipText: formStyles.chipText,
  chipTextActive: formStyles.chipTextActive,
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  gridChip: {
    ...formStyles.chip,
    width: "23%",
    alignItems: "center",
  },
  statusRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statusChip: {
    ...formStyles.chip,
    flex: 1,
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});
