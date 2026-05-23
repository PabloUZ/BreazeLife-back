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
import { registerEmployee } from "@/src/services/api/employeeService";
import type { PensionFundType, RegisterEmployeeDto } from "@/src/dtos/employer/employee.dtos";

const EMPLOYER_ID = "placeholder-employer-id";

const PENSION_FUND_OPTIONS: { label: string; value: PensionFundType }[] = [
    { label: "Conservador", value: "CONSERVATIVE" },
    { label: "Moderado", value: "MODERATE" },
    { label: "Mayor riesgo", value: "HIGH_RISK" },
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
        errors.email = "Correo inválido";
    if (!form.document.trim()) errors.document = "La cédula es requerida";
    if (!form.birthDate.trim())
        errors.birthDate = "La fecha de nacimiento es requerida";
    if (!form.position.trim()) errors.position = "El cargo es requerido";
    if (!form.baseSalary.trim()) errors.baseSalary = "El salario es requerido";
    else if (isNaN(Number(form.baseSalary)) || Number(form.baseSalary) <= 0)
        errors.baseSalary = "Salario inválido";
    if (!form.startDate.trim())
        errors.startDate = "La fecha de vinculación es requerida";
    return errors;
}

export default function RegisterEmployeeForm() {
    const router = useRouter();
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

            await registerEmployee(EMPLOYER_ID, payload);

            Alert.alert(
                "¡Empleado registrado!",
                `${payload.firstName} ${payload.lastName} fue registrado exitosamente.`,
                [{ text: "Ver lista", onPress: () => router.back() }]
            );
        } catch {
            Alert.alert("Error", "No se pudo registrar el empleado. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Registrar empleado</Text>
                <Text style={styles.subtitle}>Completa los datos del nuevo empleado</Text>

                {/* Datos personales */}
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
                            placeholder="Ej: Laura"
                            value={form.firstName}
                            onChangeText={(v) => handleChange("firstName", v)}
                            onFocus={() => setFocusedField("firstName")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {errors.firstName && (
                            <Text style={styles.errorText}>{errors.firstName}</Text>
                        )}
                    </View>
                    <View style={styles.halfField}>
                        <Text style={styles.label}>Apellido *</Text>
                        <TextInput
                            style={[
                                styles.input,
                                errors.lastName && styles.inputError,
                                focusedField === "lastName" && styles.inputFocused,
                            ]}
                            placeholder="Ej: Martínez"
                            value={form.lastName}
                            onChangeText={(v) => handleChange("lastName", v)}
                            onFocus={() => setFocusedField("lastName")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {errors.lastName && (
                            <Text style={styles.errorText}>{errors.lastName}</Text>
                        )}
                    </View>
                </View>

                <Text style={styles.label}>Correo electrónico *</Text>
                <TextInput
                    style={[
                        styles.input,
                        errors.email && styles.inputError,
                        focusedField === "email" && styles.inputFocused,
                    ]}
                    placeholder="correo@empresa.com"
                    value={form.email}
                    onChangeText={(v) => handleChange("email", v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                <Text style={styles.label}>Número de cédula *</Text>
                <TextInput
                    style={[
                        styles.input,
                        errors.document && styles.inputError,
                        focusedField === "document" && styles.inputFocused,
                    ]}
                    placeholder="Ej: 1234567890"
                    value={form.document}
                    onChangeText={(v) => handleChange("document", v)}
                    keyboardType="numeric"
                    onFocus={() => setFocusedField("document")}
                    onBlur={() => setFocusedField(null)}
                />
                {errors.document && (
                    <Text style={styles.errorText}>{errors.document}</Text>
                )}

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

                {/* Datos laborales */}
                <Text style={styles.sectionTitle}>Datos laborales</Text>

                <Text style={styles.label}>Cargo *</Text>
                <TextInput
                    style={[
                        styles.input,
                        errors.position && styles.inputError,
                        focusedField === "position" && styles.inputFocused,
                    ]}
                    placeholder="Ej: Desarrollador Frontend"
                    value={form.position}
                    onChangeText={(v) => handleChange("position", v)}
                    onFocus={() => setFocusedField("position")}
                    onBlur={() => setFocusedField(null)}
                />
                {errors.position && (
                    <Text style={styles.errorText}>{errors.position}</Text>
                )}

                <Text style={styles.label}>Salario base mensual (COP) *</Text>
                <TextInput
                    style={[
                        styles.input,
                        errors.baseSalary && styles.inputError,
                        focusedField === "baseSalary" && styles.inputFocused,
                    ]}
                    placeholder="Ej: 3500000"
                    value={form.baseSalary}
                    onChangeText={(v) => handleChange("baseSalary", v)}
                    keyboardType="numeric"
                    onFocus={() => setFocusedField("baseSalary")}
                    onBlur={() => setFocusedField(null)}
                />
                {errors.baseSalary && (
                    <Text style={styles.errorText}>{errors.baseSalary}</Text>
                )}

                <Text style={styles.label}>Fecha de vinculación *</Text>
                <TouchableOpacity
                    style={[styles.input, styles.dateInput, errors.startDate && styles.inputError]}
                    onPress={() => setShowStartDatePicker(true)}
                >
                    <Text style={form.startDate ? styles.dateText : styles.datePlaceholder}>
                        {form.startDate || "Seleccionar fecha"}
                    </Text>
                </TouchableOpacity>
                {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
                {showStartDatePicker && (
                    <DateTimePicker
                        value={form.startDate ? new Date(form.startDate) : new Date()}
                        mode="date"
                        display="default"
                        onChange={handleStartDateChange}
                    />
                )}

                <Text style={styles.label}>Tipo de fondo pensional *</Text>
                <View style={styles.pensionOptions}>
                    {PENSION_FUND_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.pensionChip,
                                form.pensionFundType === option.value && styles.pensionChipActive,
                            ]}
                            onPress={() => handleChange("pensionFundType", option.value)}
                        >
                            <Text
                                style={[
                                    styles.pensionChipText,
                                    form.pensionFundType === option.value && styles.pensionChipTextActive,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
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
                        <Text style={styles.submitButtonText}>Registrar empleado</Text>
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
    errorText: {
        fontSize: 12,
        color: "#EF4444",
        marginTop: 4,
    },
    pensionOptions: {
        flexDirection: "row",
        gap: 8,
        marginTop: 4,
        flexWrap: "wrap",
    },
    pensionChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    pensionChipActive: {
        backgroundColor: "#EFF6FF",
        borderColor: "#369BC9",
    },
    pensionChipText: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "500",
    },
    pensionChipTextActive: {
        color: "#369BC9",
        fontWeight: "600",
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