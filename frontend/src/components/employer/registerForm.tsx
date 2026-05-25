import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppHeader from "@/src/components/common/AppHeader";
import EmployerScreenContainer from "@/src/components/layout/EmployerScreenContainer";
import { useAuthContext } from "@/src/context/AuthContext";
import type {
  PensionFundType,
  RegisterEmployeeDto,
} from "@/src/dtos/employer/employee.dtos";
import { registerEmployee } from "@/src/services/api/employeeService";
import { colors, formStyles, spacing } from "@/src/theme";

const PENSION_FUND_OPTIONS: { label: string; value: PensionFundType }[] = [
  { label: "Conservador", value: "CONSERVATIVE" },
  { label: "Moderado", value: "MODERATE" },
  { label: "Mayor riesgo", value: "RISKY" },
];

type FormFields = {
  firstName: string;
  lastName: string;
  email: string;
  document: string;
  birthDate: string;
  position: string;
  baseSalary: string;
  pensionFundType: PensionFundType;
  startDate: string;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

const INITIAL_FORM: FormFields = {
  firstName: "",
  lastName: "",
  email: "",
  document: "",
  birthDate: "",
  position: "",
  baseSalary: "",
  pensionFundType: "MODERATE",
  startDate: "",
};

function validateForm(form: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!form.firstName.trim()) errors.firstName = "El nombre es requerido";
  if (!form.lastName.trim()) errors.lastName = "El apellido es requerido";
  if (!form.email.trim()) errors.email = "El correo es requerido";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Correo invalido";
  if (!form.document.trim()) errors.document = "La cedula es requerida";
  if (!form.birthDate.trim()) errors.birthDate = "La fecha de nacimiento es requerida";
  if (!form.position.trim()) errors.position = "El cargo es requerido";
  if (!form.baseSalary.trim()) errors.baseSalary = "El salario es requerido";
  else if (isNaN(Number(form.baseSalary)) || Number(form.baseSalary) <= 0)
    errors.baseSalary = "Salario invalido";
  if (!form.startDate.trim()) errors.startDate = "La fecha de vinculacion es requerida";
  return errors;
}

export default function RegisterEmployeeForm() {
  const router = useRouter();
  const { state } = useAuthContext();
  const employerId = state.user?.user_id ?? "";

  const [form, setForm] = useState<FormFields>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof FormFields | null>(null);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const handleChange = (field: keyof FormFields, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleBirthDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowBirthDatePicker(false);
    if (event.type === "set" && date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      handleChange("birthDate", `${year}-${month}-${day}`);
    }
  };

  const handleStartDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowStartDatePicker(false);
    if (event.type === "set" && date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      handleChange("startDate", `${year}-${month}-${day}`);
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const payload: RegisterEmployeeDto = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        document: form.document.trim(),
        birthDate: form.birthDate.trim(),
        position: form.position.trim(),
        baseSalary: Number(form.baseSalary),
        pensionFundType: form.pensionFundType,
        startDate: form.startDate.trim(),
      };

      await registerEmployee(employerId, payload);

      Alert.alert(
        "Empleado registrado",
        `${payload.firstName} ${payload.lastName} fue registrado exitosamente.`,
        [{ text: "Ver lista", onPress: () => router.replace("/(tabs)/(employer)/employees") }]
      );
    } catch {
      Alert.alert("Error", "No se pudo registrar el empleado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployerScreenContainer>
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
          title="Registrar empleado"
          subtitle="Completa la informacion personal y laboral del nuevo empleado."
        />

        <AppCard>
          <Text style={styles.sectionTitle}>Datos personales</Text>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.firstName ? styles.inputError : null,
                  focusedField === "firstName" ? styles.inputFocused : null,
                ]}
                placeholder="Ej: Laura"
                placeholderTextColor={colors.textSubtle}
                value={form.firstName}
                onChangeText={(value) => handleChange("firstName", value)}
                onFocus={() => setFocusedField("firstName")}
                onBlur={() => setFocusedField(null)}
              />
              {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Apellido *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.lastName ? styles.inputError : null,
                  focusedField === "lastName" ? styles.inputFocused : null,
                ]}
                placeholder="Ej: Martinez"
                placeholderTextColor={colors.textSubtle}
                value={form.lastName}
                onChangeText={(value) => handleChange("lastName", value)}
                onFocus={() => setFocusedField("lastName")}
                onBlur={() => setFocusedField(null)}
              />
              {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
            </View>
          </View>

          <Text style={styles.label}>Correo electronico *</Text>
          <TextInput
            style={[
              styles.input,
              errors.email ? styles.inputError : null,
              focusedField === "email" ? styles.inputFocused : null,
            ]}
            placeholder="correo@empresa.com"
            placeholderTextColor={colors.textSubtle}
            value={form.email}
            onChangeText={(value) => handleChange("email", value)}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={styles.label}>Numero de cedula *</Text>
          <TextInput
            style={[
              styles.input,
              errors.document ? styles.inputError : null,
              focusedField === "document" ? styles.inputFocused : null,
            ]}
            placeholder="Ej: 1234567890"
            placeholderTextColor={colors.textSubtle}
            value={form.document}
            onChangeText={(value) => handleChange("document", value)}
            keyboardType="numeric"
            onFocus={() => setFocusedField("document")}
            onBlur={() => setFocusedField(null)}
          />
          {errors.document ? <Text style={styles.errorText}>{errors.document}</Text> : null}

          <Text style={styles.label}>Fecha de nacimiento *</Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dateInput,
              errors.birthDate ? styles.inputError : null,
            ]}
            onPress={() => setShowBirthDatePicker(true)}
            activeOpacity={0.85}
          >
            <Text style={form.birthDate ? styles.dateText : styles.datePlaceholder}>
              {form.birthDate || "Seleccionar fecha"}
            </Text>
          </TouchableOpacity>
          {errors.birthDate ? <Text style={styles.errorText}>{errors.birthDate}</Text> : null}
          {showBirthDatePicker ? (
            <DateTimePicker
              value={form.birthDate ? new Date(form.birthDate) : new Date()}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={handleBirthDateChange}
            />
          ) : null}
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Datos laborales</Text>

          <Text style={styles.label}>Cargo *</Text>
          <TextInput
            style={[
              styles.input,
              errors.position ? styles.inputError : null,
              focusedField === "position" ? styles.inputFocused : null,
            ]}
            placeholder="Ej: Asesor pensional"
            placeholderTextColor={colors.textSubtle}
            value={form.position}
            onChangeText={(value) => handleChange("position", value)}
            onFocus={() => setFocusedField("position")}
            onBlur={() => setFocusedField(null)}
          />
          {errors.position ? <Text style={styles.errorText}>{errors.position}</Text> : null}

          <Text style={styles.label}>Salario base mensual (COP) *</Text>
          <TextInput
            style={[
              styles.input,
              errors.baseSalary ? styles.inputError : null,
              focusedField === "baseSalary" ? styles.inputFocused : null,
            ]}
            placeholder="Ej: 3500000"
            placeholderTextColor={colors.textSubtle}
            value={form.baseSalary}
            onChangeText={(value) => handleChange("baseSalary", value)}
            keyboardType="numeric"
            onFocus={() => setFocusedField("baseSalary")}
            onBlur={() => setFocusedField(null)}
          />
          {errors.baseSalary ? <Text style={styles.errorText}>{errors.baseSalary}</Text> : null}

          <Text style={styles.label}>Fecha de vinculacion *</Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dateInput,
              errors.startDate ? styles.inputError : null,
            ]}
            onPress={() => setShowStartDatePicker(true)}
            activeOpacity={0.85}
          >
            <Text style={form.startDate ? styles.dateText : styles.datePlaceholder}>
              {form.startDate || "Seleccionar fecha"}
            </Text>
          </TouchableOpacity>
          {errors.startDate ? <Text style={styles.errorText}>{errors.startDate}</Text> : null}
          {showStartDatePicker ? (
            <DateTimePicker
              value={form.startDate ? new Date(form.startDate) : new Date()}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
            />
          ) : null}

          <Text style={styles.label}>Tipo de fondo pensional *</Text>
          <View style={styles.pensionOptions}>
            {PENSION_FUND_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pensionChip,
                  form.pensionFundType === option.value ? styles.pensionChipActive : null,
                ]}
                onPress={() => handleChange("pensionFundType", option.value)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.pensionChipText,
                    form.pensionFundType === option.value
                      ? styles.pensionChipTextActive
                      : null,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </AppCard>

        <AppButton
          title="Registrar empleado"
          onPress={handleSubmit}
          loading={loading}
        />
      </ScrollView>
    </EmployerScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  topBar: {
    alignItems: "flex-start",
  },
  sectionTitle: formStyles.sectionTitle,
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  halfField: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 140,
  },
  label: formStyles.label,
  input: formStyles.input,
  inputFocused: formStyles.inputFocused,
  inputError: formStyles.inputError,
  dateInput: {
    justifyContent: "center",
  },
  dateText: {
    color: colors.text,
  },
  datePlaceholder: formStyles.placeholder,
  errorText: formStyles.errorText,
  pensionOptions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: "wrap",
  },
  pensionChip: formStyles.chip,
  pensionChipActive: formStyles.chipActive,
  pensionChipText: formStyles.chipText,
  pensionChipTextActive: formStyles.chipTextActive,
});
