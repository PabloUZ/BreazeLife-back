import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AdminScreenContainer from "@/src/components/layout/AdminScreenContainer";
import type { UpdateSystemConfigDto } from "@/src/dtos/admin/systemConfig.dtos";
import { useSystemConfig } from "@/src/hooks/useSystemConfig";
import { colors, formStyles, spacing, typography } from "@/src/theme";

function toPercent(decimal: number): string {
  return (decimal * 100).toFixed(2);
}

function fromPercent(percent: string): number {
  return parseFloat(percent) / 100;
}

function isValidRate(value: string): boolean {
  const numberValue = parseFloat(value);
  return !Number.isNaN(numberValue) && numberValue >= 0.1 && numberValue <= 5;
}

function isValidLifeExpectancy(value: string): boolean {
  const numberValue = parseInt(value, 10);
  return !Number.isNaN(numberValue) && numberValue >= 50 && numberValue <= 100;
}

function isValidContributionRate(value: string): boolean {
  const numberValue = parseFloat(value);
  return !Number.isNaN(numberValue) && numberValue >= 1 && numberValue <= 30;
}

type ConfigInputProps = {
  label: string;
  hint: string;
  value: string;
  unit: string;
  isValid: boolean;
  errorMessage: string;
  onChangeText: (value: string) => void;
  keyboardType?: "numeric" | "decimal-pad";
  tintColor?: string;
};

function ConfigInput({
  label,
  hint,
  value,
  unit,
  isValid,
  errorMessage,
  onChangeText,
  keyboardType = "decimal-pad",
  tintColor = colors.primary,
}: ConfigInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Text style={styles.inputHint}>{hint}</Text>
      <View style={[styles.inputRow, !isValid ? formStyles.inputError : null]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder="0"
          placeholderTextColor={colors.textSubtle}
        />
        <View style={[styles.unitBadge, { backgroundColor: `${tintColor}18` }]}>
          <Text style={[styles.unitText, { color: tintColor }]}>{unit}</Text>
        </View>
      </View>
      {!isValid ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}

type SectionHeaderProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
};

function SectionHeader({
  iconName,
  iconColor,
  iconBackground,
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, { backgroundColor: iconBackground }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
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

  const markDirty = (setter: (value: string) => void) => (value: string) => {
    setter(value);
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
      Alert.alert("Datos invalidos", "Revisa los campos marcados antes de guardar.");
      return;
    }

    Alert.alert(
      "Confirmar cambios",
      "Los nuevos valores se aplicaran en los siguientes procesos del sistema.",
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
            const saved = await saveConfig(payload);
            if (saved) {
              setIsDirty(false);
            }
          },
        },
      ]
    );
  };

  const handleDiscard = () => {
    Alert.alert("Descartar cambios", "Se perderan los cambios no guardados.", [
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
      <AdminScreenContainer>
        <AppLoadingState message="Cargando configuracion del sistema..." />
      </AdminScreenContainer>
    );
  }

  if (error) {
    return (
      <AdminScreenContainer>
        <AppErrorState message={error} onRetry={refresh} />
      </AdminScreenContainer>
    );
  }

  return (
    <AdminScreenContainer>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.primary} />
          }
        >
          <AppHeader
            title="Configuracion del sistema"
            subtitle="Ajusta los parametros globales del fondo de pensiones sin salir del panel administrativo."
          />

          {isDirty ? (
            <AppCard variant="muted" style={styles.warningCard}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.warningText} />
              <Text style={styles.warningText}>Tienes cambios sin guardar.</Text>
            </AppCard>
          ) : null}

          <AppCard>
            <SectionHeader
              iconName="trending-up-outline"
              iconColor={colors.info}
              iconBackground={colors.infoSoft}
              title="Tasas de rentabilidad mensual"
              subtitle="Se aplican una vez al mes segun el tipo de fondo."
            />

            <ConfigInput
              label="Fondo conservador"
              hint="Rango permitido: 0.1% a 5.0%"
              value={rateConservative}
              unit="%"
              tintColor={colors.info}
              isValid={!isDirty || isValidRate(rateConservative)}
              errorMessage="Ingresa un valor entre 0.1 y 5.0."
              onChangeText={markDirty(setRateConservative)}
            />
            <ConfigInput
              label="Fondo moderado"
              hint="Rango permitido: 0.1% a 5.0%"
              value={rateModerate}
              unit="%"
              tintColor={colors.warning}
              isValid={!isDirty || isValidRate(rateModerate)}
              errorMessage="Ingresa un valor entre 0.1 y 5.0."
              onChangeText={markDirty(setRateModerate)}
            />
            <ConfigInput
              label="Fondo mayor riesgo"
              hint="Rango permitido: 0.1% a 5.0%"
              value={rateRisky}
              unit="%"
              tintColor={colors.danger}
              isValid={!isDirty || isValidRate(rateRisky)}
              errorMessage="Ingresa un valor entre 0.1 y 5.0."
              onChangeText={markDirty(setRateRisky)}
            />
          </AppCard>

          <AppCard>
            <SectionHeader
              iconName="analytics-outline"
              iconColor={colors.success}
              iconBackground={colors.successSoft}
              title="Parametros actuariales"
              subtitle="Se usan en el simulador de pension y en los calculos proyectados."
            />

            <ConfigInput
              label="Expectativa de vida"
              hint="Rango permitido: 50 a 100 anos"
              value={lifeExpectancy}
              unit="anos"
              tintColor={colors.success}
              keyboardType="numeric"
              isValid={!isDirty || isValidLifeExpectancy(lifeExpectancy)}
              errorMessage="Ingresa un valor entre 50 y 100."
              onChangeText={markDirty(setLifeExpectancy)}
            />
            <ConfigInput
              label="Porcentaje de cotizacion"
              hint="Rango permitido: 1% a 30% del salario"
              value={contributionRate}
              unit="%"
              tintColor={colors.success}
              isValid={!isDirty || isValidContributionRate(contributionRate)}
              errorMessage="Ingresa un valor entre 1 y 30."
              onChangeText={markDirty(setContributionRate)}
            />
          </AppCard>

          <AppCard variant="tint" style={styles.noteCard}>
            <Ionicons name="information-circle-outline" size={18} color={colors.infoText} />
            <Text style={styles.noteText}>
              Las tasas nuevas se aplican en la siguiente ejecucion de rentabilidad mensual.
              El porcentaje de cotizacion impacta las nuevas liquidaciones de nomina.
            </Text>
          </AppCard>

          <View style={styles.actions}>
            {isDirty ? (
              <AppButton
                title="Descartar cambios"
                variant="secondary"
                onPress={handleDiscard}
                disabled={isSaving}
                style={styles.actionButton}
              />
            ) : null}
            <AppButton
              title="Guardar cambios"
              iconName="checkmark-circle-outline"
              onPress={handleSave}
              disabled={!isDirty || !isFormValid}
              loading={isSaving}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AdminScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderColor: "#FDE68A",
  },
  warningText: {
    ...typography.bodyStrong,
    color: colors.warningText,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  inputGroup: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  inputLabel: {
    ...formStyles.label,
    marginTop: 0,
    marginBottom: 0,
  },
  inputHint: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  input: {
    ...formStyles.input,
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    minHeight: 52,
  },
  unitBadge: {
    minWidth: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  unitText: {
    ...typography.bodyStrong,
  },
  errorText: {
    ...formStyles.errorText,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  noteText: {
    ...typography.body,
    color: colors.infoText,
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
  },
  actionButton: {
    width: "100%",
  },
});
