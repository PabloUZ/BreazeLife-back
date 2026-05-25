import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppHeader from "@/src/components/common/AppHeader";
import EmployerScreenContainer from "@/src/components/layout/EmployerScreenContainer";
import { useAuthContext } from "@/src/context/AuthContext";
import type {
  ChangeSalaryPositionDto,
  EmployeeDetailDto,
} from "@/src/dtos/employer/employee.dtos";
import { changeSalaryPosition } from "@/src/services/api/employeeService";
import { colors, formStyles, spacing } from "@/src/theme";

type FormFields = {
  position: string;
  baseSalary: string;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

function validateForm(form: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!form.position.trim()) errors.position = "El cargo es requerido";
  if (!form.baseSalary.trim()) errors.baseSalary = "El salario es requerido";
  else if (isNaN(Number(form.baseSalary)) || Number(form.baseSalary) <= 0)
    errors.baseSalary = "Salario invalido";
  return errors;
}

type ChangeSalaryPositionFormProps = {
  employee: EmployeeDetailDto;
};

export default function ChangeSalaryPositionForm({
  employee,
}: ChangeSalaryPositionFormProps) {
  const router = useRouter();
  const { state } = useAuthContext();
  const employerId = state.user?.user_id ?? "";
  const [form, setForm] = useState<FormFields>({
    position: employee.position,
    baseSalary: employee.baseSalary.toString(),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof FormFields | null>(null);

  const handleChange = (field: keyof FormFields, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const payload: ChangeSalaryPositionDto = {
        position: form.position.trim(),
        baseSalary: Number(form.baseSalary),
      };

      await changeSalaryPosition(employerId, employee.contractId, payload);

      Alert.alert(
        "Cambio realizado",
        `El cargo y salario de ${employee.firstName} ${employee.lastName} fueron actualizados exitosamente.`,
        [{ text: "Ver lista", onPress: () => router.replace("/(tabs)/(employer)/employees") }]
      );
    } catch {
      Alert.alert("Error", "No se pudo actualizar el cargo y salario. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployerScreenContainer>
      <KeyboardAvoidingView behavior="position" style={styles.keyboardContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.topBar}>
            <AppButton
              title="Volver"
              variant="secondary"
              iconName="arrow-back-outline"
              onPress={() => router.back()}
            />
          </View>

          <AppHeader
            title="Cambiar cargo y salario"
            subtitle={`${employee.firstName} ${employee.lastName}`}
          />

          <AppCard>
            <Text style={styles.sectionTitle}>Valores actuales</Text>

            <Text style={styles.label}>Cargo actual</Text>
            <View style={styles.readonlyInput}>
              <Text style={styles.readonlyText}>{employee.position}</Text>
            </View>

            <Text style={styles.label}>Salario actual</Text>
            <View style={styles.readonlyInput}>
              <Text style={styles.readonlyText}>
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                }).format(employee.baseSalary)}
              </Text>
            </View>
          </AppCard>

          <AppCard>
            <Text style={styles.sectionTitle}>Nuevos valores</Text>

            <Text style={styles.label}>Nuevo cargo *</Text>
            <TextInput
              style={[
                styles.input,
                errors.position ? styles.inputError : null,
                focusedField === "position" ? styles.inputFocused : null,
              ]}
              value={form.position}
              onChangeText={(value) => handleChange("position", value)}
              onFocus={() => setFocusedField("position")}
              onBlur={() => setFocusedField(null)}
            />
            {errors.position ? <Text style={styles.errorText}>{errors.position}</Text> : null}

            <Text style={styles.label}>Nuevo salario base (COP) *</Text>
            <TextInput
              style={[
                styles.input,
                errors.baseSalary ? styles.inputError : null,
                focusedField === "baseSalary" ? styles.inputFocused : null,
              ]}
              value={form.baseSalary}
              onChangeText={(value) => handleChange("baseSalary", value)}
              keyboardType="numeric"
              onFocus={() => setFocusedField("baseSalary")}
              onBlur={() => setFocusedField(null)}
            />
            {errors.baseSalary ? <Text style={styles.errorText}>{errors.baseSalary}</Text> : null}
          </AppCard>

          <AppButton title="Guardar cambios" onPress={handleSubmit} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </EmployerScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  topBar: {
    alignItems: "flex-start",
  },
  sectionTitle: formStyles.sectionTitle,
  label: formStyles.label,
  input: formStyles.input,
  inputFocused: formStyles.inputFocused,
  inputError: formStyles.inputError,
  readonlyInput: formStyles.readonlyInput,
  readonlyText: formStyles.readonlyText,
  errorText: formStyles.errorText,
});
