import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import { useSystemConfig } from "@/src/hooks/useSystemConfig";
import type { UpdateSystemConfigDto } from "@/src/dtos/admin/systemConfig.dtos";

function toPercent(decimal: number): string {
  return (decimal * 100).toFixed(2);
}

function fromPercent(percent: string): number {
  return parseFloat(percent) / 100;
}

function isValidRate(val: string): boolean {
  const n = parseFloat(val);
  return !isNaN(n) && n >= 0.1 && n <= 5;
}

function isValidLifeExpectancy(val: string): boolean {
  const n = parseInt(val, 10);
  return !isNaN(n) && n >= 50 && n <= 100;
}

function isValidContributionRate(val: string): boolean {
  const n = parseFloat(val);
  return !isNaN(n) && n >= 1 && n <= 30;
}

interface ConfigInputProps {
  label: string;
  hint: string;
  value: string;
  unit: string;
  isValid: boolean;
  errorMsg: string;
  onChangeText: (v: string) => void;
  keyboardType?: "numeric" | "decimal-pad";
  color?: string;
}

function ConfigInput({
  label, hint, value, unit, isValid, errorMsg,
  onChangeText, keyboardType = "decimal-pad", color = "#369BC9",
}: ConfigInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Text style={styles.inputHint}>{hint}</Text>
      <View style={[styles.inputRow, !isValid && styles.inputRowError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
        <View style={[styles.unitBadge, { backgroundColor: color + "20" }]}>
          <Text style={[styles.unitText, { color }]}>{unit}</Text>
        </View>
      </View>
      {!isValid && <Text style={styles.errorText}>{errorMsg}</Text>}
    </View>
  );
}

export default function AdminSettingsScreen() {
  const { config, error, isLoading, isRefreshing, isSaving, refresh, saveConfig } =
    useSystemConfig();

  const [rateConservative, setRateConservative] = useState("");
  const [rateModerate, setRateModerate] = useState("");
  const [rateRisky, setRateRisky] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState("");
  const [contributionRate, setContributionRate] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setRateConservative(toPercent(config.rate_conservative));
    setRateModerate(toPercent(config.rate_moderate));
    setRateRisky(toPercent(config.rate_risky));
    setLifeExpectancy(String(config.life_expectancy));
    setContributionRate(toPercent(config.contribution_rate));
    setIsDirty(false);
  }, [config]);

  const markDirty = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setIsDirty(true);
  };

  const isFormValid =
    isValidRate(rateConservative) &&
    isValidRate(rateModerate) &&
    isValidRate(rateRisky) &&
    isValidLifeExpectancy(lifeExpectancy) &&
    isValidContributionRate(contributionRate);

  const handleSave = () => {
    if (!isFormValid) {
      Alert.alert("Datos inválidos", "Revisa los campos marcados en rojo antes de guardar.");
      return;
    }
    Alert.alert(
      "Confirmar cambios",
      "¿Estás seguro de que deseas actualizar la configuración del sistema? Los nuevos valores aplicarán en los próximos procesos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Guardar",
          onPress: async () => {
            const payload: UpdateSystemConfigDto = {
              rate_conservative: fromPercent(rateConservative),
              rate_moderate: fromPercent(rateModerate),
              rate_risky: fromPercent(rateRisky),
              life_expectancy: parseInt(lifeExpectancy, 10),
              contribution_rate: fromPercent(contributionRate),
            };
            const ok = await saveConfig(payload);
            if (ok) setIsDirty(false);
          },
        },
      ]
    );
  };

  const handleDiscard = () => {
    Alert.alert("Descartar cambios", "Se perderán los cambios no guardados.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Descartar",
        style: "destructive",
        onPress: () => {
          setRateConservative(toPercent(config.rate_conservative));
          setRateModerate(toPercent(config.rate_moderate));
          setRateRisky(toPercent(config.rate_risky));
          setLifeExpectancy(String(config.life_expectancy));
          setContributionRate(toPercent(config.contribution_rate));
          setIsDirty(false);
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#369BC9" />
          <Text style={styles.loadingText}>Cargando configuración del sistema...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.errorBanner}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Configuración del sistema</Text>
            <Text style={styles.subtitle}>
              Ajusta los parámetros globales que aplican a todos los procesos del fondo de pensiones.
            </Text>
          </View>

          {isDirty && (
            <View style={styles.dirtyBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#92400E" />
              <Text style={styles.dirtyBannerText}>Tienes cambios sin guardar.</Text>
            </View>
          )}

          {/* Tasas de rentabilidad */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="trending-up" size={18} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Tasas de rentabilidad mensual</Text>
                <Text style={styles.sectionSubtitle}>Se aplican una vez al mes según el tipo de fondo</Text>
              </View>
            </View>
            <ConfigInput label="Fondo Conservador" hint="Rango: 0.1% – 5.0%" value={rateConservative}
              unit="%" color="#3B82F6" isValid={!isDirty || isValidRate(rateConservative)}
              errorMsg="Valor entre 0.1 y 5.0" onChangeText={markDirty(setRateConservative)} />
            <ConfigInput label="Fondo Moderado" hint="Rango: 0.1% – 5.0%" value={rateModerate}
              unit="%" color="#F59E0B" isValid={!isDirty || isValidRate(rateModerate)}
              errorMsg="Valor entre 0.1 y 5.0" onChangeText={markDirty(setRateModerate)} />
            <ConfigInput label="Fondo Mayor Riesgo" hint="Rango: 0.1% – 5.0%" value={rateRisky}
              unit="%" color="#EF4444" isValid={!isDirty || isValidRate(rateRisky)}
              errorMsg="Valor entre 0.1 y 5.0" onChangeText={markDirty(setRateRisky)} />
          </View>

          {/* Parámetros actuariales */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="analytics-outline" size={18} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Parámetros actuariales</Text>
                <Text style={styles.sectionSubtitle}>Usados en el simulador de pensión y cálculos proyectados</Text>
              </View>
            </View>
            <ConfigInput label="Expectativa de vida" hint="Años promedio (50 – 100)"
              value={lifeExpectancy} unit="años" color="#10B981" keyboardType="numeric"
              isValid={!isDirty || isValidLifeExpectancy(lifeExpectancy)}
              errorMsg="Valor entre 50 y 100" onChangeText={markDirty(setLifeExpectancy)} />
            <ConfigInput label="Porcentaje de cotización vigente" hint="% del salario (1% – 30%)"
              value={contributionRate} unit="%" color="#10B981"
              isValid={!isDirty || isValidContributionRate(contributionRate)}
              errorMsg="Valor entre 1 y 30" onChangeText={markDirty(setContributionRate)} />
          </View>

          {/* Nota */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>
              Los cambios en las tasas aplican en la próxima ejecución de rentabilidad mensual.
              El porcentaje de cotización aplica a nuevas liquidaciones de nómina.
            </Text>
          </View>

          {/* Acciones */}
          <View style={styles.actions}>
            {isDirty && (
              <TouchableOpacity style={styles.discardButton} onPress={handleDiscard} disabled={isSaving}>
                <Text style={styles.discardButtonText}>Descartar cambios</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.saveButton, (!isDirty || !isFormValid || isSaving) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!isDirty || !isFormValid || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: "#6B7280" },
  errorBanner: { fontSize: 14, color: "#EF4444", textAlign: "center", paddingHorizontal: 24 },
  retryButton: { backgroundColor: "#369BC9", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  content: { paddingBottom: 40, gap: 16 },
  header: { gap: 4 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6B7280", lineHeight: 20 },
  dirtyBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  dirtyBannerText: { fontSize: 13, color: "#92400E", flex: 1 },
  section: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#E5E7EB", gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  sectionHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  sectionIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  sectionSubtitle: { fontSize: 12, color: "#6B7280", lineHeight: 16, marginTop: 2 },
  inputGroup: { gap: 4 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
  inputHint: { fontSize: 11, color: "#9CA3AF" },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, overflow: "hidden",
  },
  inputRowError: { borderColor: "#EF4444" },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: "#111827" },
  unitBadge: { paddingHorizontal: 14, paddingVertical: 12, borderLeftWidth: 1, borderLeftColor: "#E5E7EB" },
  unitText: { fontSize: 14, fontWeight: "700" },
  errorText: { fontSize: 11, color: "#EF4444" },
  infoCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 12, padding: 12,
  },
  infoText: { flex: 1, fontSize: 12, color: "#6B7280", lineHeight: 18 },
  actions: { gap: 10 },
  discardButton: { backgroundColor: "#F3F4F6", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  discardButtonText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  saveButton: {
    backgroundColor: "#369BC9", borderRadius: 12, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  saveButtonDisabled: { opacity: 0.45 },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});

