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
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import { updateEmployee } from "@/src/services/api/employeeService";
import type { EmployeeDetailDto, UpdateEmployeeDto } from "@/src/dtos/employer/employee.dtos";

const EMPLOYER_ID = "placeholder-employer-id";

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
        errors.email = "Correo inválido";
    if (!form.birthDate.trim()) errors.birthDate = "La fecha de nacimiento es requerida";
    return errors;
}

type EditEmployeeFormProps = {
    employee: EmployeeDetailDto;
};

export default function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
    const router = useRouter();
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

            await updateEmployee(EMPLOYER_ID, employee.contractId, payload);

            Alert.alert(
                "¡Empleado actualizado!",
                `La información de ${payload.firstName} ${payload.lastName} fue actualizada exitosamente.`,
                [{ text: "Aceptar", onPress: () => router.replace("/(tabs)/(employer)/employees") }]
            );
        } catch {
            Alert.alert("Error", "No se pudo actualizar el empleado. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Editar empleado</Text>
                <Text style={styles.subtitle}>Modifica los datos básicos del empleado</Text>

                {/* Datos editables */}
                <Text style={styles.sectionTitle}>Datos personales</Text>

                <View style={styles.row}>
                    <View style={styles.halfField}>
                        <Text style={styles.label}>Nombre *</Text>
                        <TextInput
                            style={[
                                styles.input,
                                errors.firstName && styles.inputError,
                                focusedField === "firstName" && styles.inputFocused,
                            ]}
                            value={form.firstName}
                            onChangeText={(v) => handleChange("firstName", v)}
                            onFocus={() => setFocusedField("firstName")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                    </View>
                    <View style={styles.halfField}>
                        <Text style={styles.label}>Apellido *</Text>
                        <TextInput
                            style={[
                                styles.input,
                                errors.lastName && styles.inputError,
                                focusedField === "lastName" && styles.inputFocused,
                            ]}
                            value={form.lastName}
                            onChangeText={(v) => handleChange("lastName", v)}
                            onFocus={() => setFocusedField("lastName")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                    </View>
                </View>

                <Text style={styles.label}>Correo electrónico *</Text>
                <TextInput
                    style={[
                        styles.input,
                        errors.email && styles.inputError,
                        focusedField === "email" && styles.inputFocused,
                    ]}
                    value={form.email}
                    onChangeText={(v) => handleChange("email", v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                <Text style={styles.label}>Fecha de nacimiento *</Text>
                <TouchableOpacity
                    style={[styles.input, styles.dateInput, errors.birthDate && styles.inputError]}
                    onPress={() => setShowBirthDatePicker(true)}
                >
                    <Text style={form.birthDate ? styles.dateText : styles.datePlaceholder}>
                        {form.birthDate || "Seleccionar fecha"}
                    </Text>
                </TouchableOpacity>
                {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
                {showBirthDatePicker && (
                    <DateTimePicker
                        value={form.birthDate ? new Date(form.birthDate) : new Date()}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        onChange={handleBirthDateChange}
                    />
                )}

                {/* Datos no editables */}
                <Text style={styles.sectionTitle}>Datos no editables</Text>

                <Text style={styles.label}>Cargo</Text>
                <View style={styles.readonlyInput}>
                    <Text style={styles.readonlyText}>{employee.position}</Text>
                </View>

                <Text style={styles.label}>Cédula</Text>
                <View style={styles.readonlyInput}>
                    <Text style={styles.readonlyText}>{employee.document}</Text>
                </View>

                {/* Botón submit */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Guardar cambios</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 12,
        marginTop: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    halfField: {
        flex: 1,
    },
    label: {
        fontSize: 13,
        fontWeight: "500",
        color: "#374151",
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: "#16A34A",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: "#111827",
        backgroundColor: "#FFFFFF",
    },
    inputError: {
        borderColor: "#EF4444",
        borderWidth: 2,
    },
    inputFocused: {
        borderColor: "#369BC9",
        borderWidth: 2,
    },
    dateInput: {
        justifyContent: "center",
    },
    dateText: {
        fontSize: 14,
        color: "#111827",
    },
    datePlaceholder: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    readonlyInput: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#F9FAFB",
    },
    readonlyText: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    errorText: {
        fontSize: 12,
        color: "#EF4444",
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: "#369BC9",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 24,
    },
    submitButtonDisabled: {
        backgroundColor: "#93C5FD",
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    bottomSpacing: {
        height: 40,
    },
});