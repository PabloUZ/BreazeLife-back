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
  EmployeeDetailDto,
  UpdateEmployeeDto,
} from "@/src/dtos/employer/employee.dtos";
import { updateEmployee } from "@/src/services/api/employeeService";
import { colors, formStyles, spacing } from "@/src/theme";

type FormFields = {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

function validateForm(form: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!form.firstName.trim()) errors.firstName = "El nombre es requerido";
  if (!form.lastName.trim()) errors.lastName = "El apellido es requerido";
  if (!form.email.trim()) errors.email = "El correo es requerido";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Correo invalido";
  if (!form.birthDate.trim()) errors.birthDate = "La fecha de nacimiento es requerida";
  return errors;
}

type EditEmployeeFormProps = {
  employee: EmployeeDetailDto;
};

export default function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
  const router = useRouter();
  const { state } = useAuthContext();
  const employerId = state.user?.user_id ?? "";

  const [form, setForm] = useState<FormFields>({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    birthDate: employee.birthDate,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof FormFields | null>(null);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

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

  const handleSubmit = async () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const payload: UpdateEmployeeDto = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        birthDate: form.birthDate.trim(),
      };

      await updateEmployee(employerId, employee.contractId, payload);

      Alert.alert(
        "Empleado actualizado",
        `La informacion de ${payload.firstName} ${payload.lastName} fue actualizada exitosamente.`,
        [{ text: "Aceptar", onPress: () => router.replace("/(tabs)/(employer)/employees") }]
      );
    } catch {
      Alert.alert("Error", "No se pudo actualizar el empleado. Intenta de nuevo.");
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
          title="Editar empleado"
          subtitle="Actualiza los datos personales y conserva la informacion laboral vinculada."
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
            value={form.email}
            onChangeText={(value) => handleChange("email", value)}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

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
          <Text style={styles.sectionTitle}>Datos no editables</Text>
          <Text style={styles.label}>Cargo</Text>
          <View style={styles.readonlyInput}>
            <Text style={styles.readonlyText}>{employee.position}</Text>
          </View>

          <Text style={styles.label}>Cedula</Text>
          <View style={styles.readonlyInput}>
            <Text style={styles.readonlyText}>{employee.document}</Text>
          </View>

          <AppButton
            title="Cambiar cargo y salario"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: "/(tabs)/(employer)/change-salary-position" as any,
                params: { contractId: employee.contractId },
              })
            }
            style={styles.secondaryAction}
          />
        </AppCard>

        <AppButton title="Guardar cambios" onPress={handleSubmit} loading={loading} />
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
  readonlyInput: formStyles.readonlyInput,
  readonlyText: formStyles.readonlyText,
  errorText: formStyles.errorText,
  secondaryAction: {
    marginTop: spacing.lg,
  },
});
