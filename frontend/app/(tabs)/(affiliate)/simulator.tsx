import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { simulatePension, type SimulatorResponse, type AccountType } from "@/src/services/api/simulatorService";

// ── Tipos ─────────────────────────────────────────────────────────────────────

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CONSERVATIVE: "Conservador (0.4% mensual)",
  MODERATE: "Moderado (0.6% mensual)",
  RISKY: "Mayor Riesgo (0.8% mensual)",
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// ── Componente principal ──────────────────────────────────────────────────────

export default function AffiliateSimulatorScreen() {
  // Inputs del simulador
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("65");
  const [monthlySalary, setMonthlySalary] = useState("2000000");
  const [currentBalance, setCurrentBalance] = useState("0");
  const [currentQuotedDays, setCurrentQuotedDays] = useState("0");
  const [accountType, setAccountType] = useState<AccountType>("MODERATE");

  // Estado de resultados
  const [result, setResult] = useState<SimulatorResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Simular ─────────────────────────────────────────────────────────────────

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
      Alert.alert("Error", "No se pudo calcular la simulación.");
    } finally {
      setLoading(false);
    }
  };

  // ── Gráfica simple de barras ─────────────────────────────────────────────────

  const renderGrowthChart = () => {
    if (!result) return null;

    // Tomar puntos cada 12 meses para no saturar la vista
    const points = result.growthData.filter((_, i) => i % 12 === 0);
    const maxBalance = Math.max(...points.map((p) => p.balance));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Crecimiento del Saldo</Text>
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
      </View>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Simulador de Pensión</Text>
        <Text style={styles.headerSubtitle}>
          Proyecta tu saldo y mesada mensual al retiro
        </Text>
      </View>

      {/* Formulario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parámetros de Simulación</Text>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Edad actual</Text>
            <TextInput
              style={styles.input}
              value={currentAge}
              onChangeText={setCurrentAge}
              keyboardType="numeric"
              placeholder="30"
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
            />
          </View>
        </View>

        <Text style={styles.label}>Salario mensual esperado ($)</Text>
        <TextInput
          style={styles.input}
          value={monthlySalary}
          onChangeText={setMonthlySalary}
          keyboardType="numeric"
          placeholder="2000000"
        />

        <Text style={styles.label}>Saldo actual acumulado ($)</Text>
        <TextInput
          style={styles.input}
          value={currentBalance}
          onChangeText={setCurrentBalance}
          keyboardType="numeric"
          placeholder="0"
        />

        <Text style={styles.label}>Días cotizados actuales</Text>
        <TextInput
          style={styles.input}
          value={currentQuotedDays}
          onChangeText={setCurrentQuotedDays}
          keyboardType="numeric"
          placeholder="0"
        />

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
                    : "Mayor Riesgo"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.simulateButton, loading && styles.simulateButtonDisabled]}
          onPress={handleSimulate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.simulateButtonText}>Calcular Proyección</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Resultados */}
      {result && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen de Proyección</Text>

            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Saldo futuro proyectado</Text>
                <Text style={styles.resultValueHighlight}>
                  {formatCurrency(result.summary.futureBalance)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Mesada mensual estimada</Text>
                <Text style={styles.resultValueHighlight}>
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
              <View style={styles.divider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Semanas al retiro</Text>
                <Text style={styles.resultValue}>
                  {result.summary.totalWeeksAtRetirement.toFixed(1)} sem
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>¿Puede pensionarse?</Text>
                <Text
                  style={[
                    styles.resultValue,
                    result.summary.canRetire
                      ? styles.resultValueGreen
                      : styles.resultValueRed,
                  ]}
                >
                  {result.summary.canRetire ? "✅ Sí" : "❌ No (faltan semanas)"}
                </Text>
              </View>
              {!result.summary.canRetire && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Semanas faltantes</Text>
                    <Text style={[styles.resultValue, styles.resultValueRed]}>
                      {result.summary.weeksStillNeeded.toFixed(1)} sem
                    </Text>
                  </View>
                </>
              )}
              <View style={styles.divider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tipo de fondo</Text>
                <Text style={styles.resultValue}>{result.summary.accountType}</Text>
              </View>
            </View>
          </View>

          {/* Gráfica */}
          {renderGrowthChart()}
        </>
      )}
    </ScrollView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    backgroundColor: "#0F2850",
    padding: 24,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#B4C8E6",
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F2850",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 0,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: "#444",
    marginBottom: 6,
    marginTop: 12,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#DDE3EE",
    color: "#222",
  },
  accountTypeButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  accountTypeButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDE3EE",
  },
  accountTypeButtonActive: {
    backgroundColor: "#0066CC",
    borderColor: "#0066CC",
  },
  accountTypeButtonText: {
    fontSize: 11,
    color: "#444",
    fontWeight: "500",
    textAlign: "center",
  },
  accountTypeButtonTextActive: {
    color: "#fff",
  },
  simulateButton: {
    backgroundColor: "#0F2850",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  simulateButtonDisabled: {
    backgroundColor: "#7A94B5",
  },
  simulateButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F3FA",
  },
  resultLabel: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F2850",
  },
  resultValueHighlight: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0066CC",
  },
  resultValueGreen: {
    color: "#2E7D32",
  },
  resultValueRed: {
    color: "#C62828",
  },
  chartContainer: {
    padding: 16,
    marginBottom: 24,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 180,
    gap: 8,
    paddingBottom: 24,
  },
  barWrapper: {
    alignItems: "center",
    width: 40,
  },
  barValue: {
    fontSize: 9,
    color: "#666",
    marginBottom: 4,
  },
  barBackground: {
    width: 28,
    height: 140,
    backgroundColor: "#E8EFF8",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    backgroundColor: "#0066CC",
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 9,
    color: "#888",
    marginTop: 4,
  },
});
