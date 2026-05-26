import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppHeader from "@/src/components/common/AppHeader";
import AffiliateScreenContainer from "@/src/components/layout/AffiliateScreenContainer";
import {
  simulatePension,
  type AccountType,
  type SimulatorResponse,
} from "@/src/services/api/simulatorService";
import { colors, radius, spacing, typography } from "@/src/theme";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function AffiliateSimulatorScreen() {
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("65");
  const [monthlySalary, setMonthlySalary] = useState("2000000");
  const [currentBalance, setCurrentBalance] = useState("0");
  const [currentQuotedDays, setCurrentQuotedDays] = useState("0");
  const [accountType, setAccountType] = useState<AccountType>("MODERATE");
  const [result, setResult] = useState<SimulatorResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    const cAge = parseInt(currentAge);
    const rAge = parseInt(retirementAge);
    const salary = parseFloat(monthlySalary);
    const balance = parseFloat(currentBalance);
    const quotedDays = parseInt(currentQuotedDays);

    if (isNaN(cAge) || isNaN(rAge) || isNaN(salary)) {
      Alert.alert("Error", "Por favor completa todos los campos correctamente.");
      return;
    }

    if (rAge <= cAge) {
      Alert.alert("Error", "La edad de retiro debe ser mayor a la edad actual.");
      return;
    }

    setLoading(true);
    try {
      const response = await simulatePension({
        currentAge: cAge,
        retirementAge: rAge,
        expectedMonthlySalary: salary,
        accountType,
        currentBalance: balance,
        currentQuotedDays: quotedDays,
      });
      setResult(response);
    } catch {
      Alert.alert("Error", "No se pudo calcular la simulacion.");
    } finally {
      setLoading(false);
    }
  };

  const renderGrowthChart = () => {
    if (!result) return null;

    const points = result.growthData.filter((_, index) => index % 12 === 0);
    const maxBalance = Math.max(...points.map((point) => point.balance));

    return (
      <AppCard>
        <Text style={styles.sectionTitle}>Crecimiento del saldo</Text>
        <Text style={styles.sectionSubtitle}>
          Vista anual de la proyeccion del fondo.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chart}>
            {points.map((point) => {
              const heightPercent = (point.balance / maxBalance) * 100;
              return (
                <View key={`${point.year}-${point.month}`} style={styles.barWrapper}>
                  <Text style={styles.barValue}>
                    {(point.balance / 1000000).toFixed(0)}M
                  </Text>
                  <View style={styles.barBackground}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${Math.max(heightPercent, 2)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{point.year}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </AppCard>
    );
  };

  return (
    <AffiliateScreenContainer>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="Simulador pensional"
          subtitle="Proyecta tu saldo y tu mesada estimada sin cambiar ningun dato real de tu cuenta."
        />

        <AppCard>
          <Text style={styles.sectionTitle}>Parametros de simulacion</Text>
          <Text style={styles.sectionSubtitle}>
            Ajusta tus datos y calcula una proyeccion estimada para el retiro.
          </Text>

          <View style={styles.inputGridRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Edad actual</Text>
              <TextInput
                style={styles.input}
                value={currentAge}
                onChangeText={setCurrentAge}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor={colors.textSubtle}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Edad de retiro</Text>
              <TextInput
                style={styles.input}
                value={retirementAge}
                onChangeText={setRetirementAge}
                keyboardType="numeric"
                placeholder="65"
                placeholderTextColor={colors.textSubtle}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Salario mensual esperado ($)</Text>
            <TextInput
              style={styles.input}
              value={monthlySalary}
              onChangeText={setMonthlySalary}
              keyboardType="numeric"
              placeholder="2000000"
              placeholderTextColor={colors.textSubtle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Saldo actual acumulado ($)</Text>
            <TextInput
              style={styles.input}
              value={currentBalance}
              onChangeText={setCurrentBalance}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textSubtle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dias cotizados actuales</Text>
            <TextInput
              style={styles.input}
              value={currentQuotedDays}
              onChangeText={setCurrentQuotedDays}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textSubtle}
            />
          </View>

          <Text style={styles.label}>Tipo de fondo</Text>
          <View style={styles.accountTypeButtons}>
            {(["CONSERVATIVE", "MODERATE", "RISKY"] as AccountType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.accountTypeButton,
                  accountType === type && styles.accountTypeButtonActive,
                ]}
                onPress={() => setAccountType(type)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.accountTypeButtonText,
                    accountType === type && styles.accountTypeButtonTextActive,
                  ]}
                >
                  {type === "CONSERVATIVE"
                    ? "Conservador"
                    : type === "MODERATE"
                      ? "Moderado"
                      : "Mayor riesgo"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <AppButton
            title="Calcular proyeccion"
            onPress={handleSimulate}
            loading={loading}
            style={styles.ctaButton}
          />
        </AppCard>

        {result ? (
          <AppCard>
            <Text style={styles.sectionTitle}>Resumen de proyeccion</Text>
            <Text style={styles.sectionSubtitle}>
              Resultado estimado con los valores ingresados.
            </Text>

            <View style={styles.resultBox}>
              <Text style={styles.resultHighlightLabel}>Saldo futuro proyectado</Text>
              <Text style={styles.resultHighlightValue}>
                {formatCurrency(result.summary.futureBalance)}
              </Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultHighlightLabel}>Mesada mensual estimada</Text>
              <Text style={styles.resultHighlightValue}>
                {formatCurrency(result.summary.monthlyPension)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Meses hasta el retiro</Text>
              <Text style={styles.resultValue}>
                {result.summary.monthsRemaining} meses
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Semanas al retiro</Text>
              <Text style={styles.resultValue}>
                {result.summary.totalWeeksAtRetirement.toFixed(1)} sem
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Tipo de fondo</Text>
              <Text style={styles.resultValue}>{result.summary.accountType}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Puede pensionarse</Text>
              <Text
                style={[
                  styles.resultValue,
                  result.summary.canRetire
                    ? styles.resultValueGreen
                    : styles.resultValueRed,
                ]}
              >
                {result.summary.canRetire ? "Si" : "No"}
              </Text>
            </View>

            {!result.summary.canRetire ? (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Semanas faltantes</Text>
                <Text style={[styles.resultValue, styles.resultValueRed]}>
                  {result.summary.weeksStillNeeded.toFixed(1)} sem
                </Text>
              </View>
            ) : null}
          </AppCard>
        ) : null}

        {renderGrowthChart()}
      </ScrollView>
    </AffiliateScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  sectionTitle: {
    ...typography.cardTitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  inputGridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  inputGroup: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 140,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    ...typography.body,
  },
  accountTypeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  accountTypeButton: {
    flexGrow: 1,
    flexBasis: "31%",
    minWidth: 110,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  accountTypeButtonActive: {
    backgroundColor: colors.surfaceTint,
    borderColor: colors.primary,
  },
  accountTypeButtonText: {
    ...typography.caption,
    color: colors.neutralText,
    textAlign: "center",
  },
  accountTypeButtonTextActive: {
    color: colors.primary,
  },
  ctaButton: {
    marginTop: spacing.lg,
  },
  resultBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  resultHighlightLabel: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  resultHighlightValue: {
    ...typography.sectionTitle,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  resultLabel: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
  },
  resultValue: {
    ...typography.bodyStrong,
    color: colors.neutralText,
    flexShrink: 1,
    textAlign: "right",
  },
  resultValueGreen: {
    color: colors.successText,
  },
  resultValueRed: {
    color: colors.dangerText,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 180,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  barWrapper: {
    alignItems: "center",
    width: 44,
  },
  barValue: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  barBackground: {
    width: 28,
    height: 140,
    backgroundColor: colors.border,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  barLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: spacing.xs,
  },
});
