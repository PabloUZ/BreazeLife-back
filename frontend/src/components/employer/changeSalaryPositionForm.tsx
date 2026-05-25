import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import { changeSalaryPosition } from "@/src/services/api/employeeService";
import type { EmployeeDetailDto, ChangeSalaryPositionDto } from "@/src/dtos/employer/employee.dtos";
import { useAuthContext } from "@/src/context/AuthContext";

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
        errors.baseSalary = "Salario inválido";
    return errors;
}

type ChangeSalaryPositionFormProps = {
    employee: EmployeeDetailDto;
};

export default function ChangeSalaryPositionForm({ employee }: ChangeSalaryPositionFormProps) {
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
                "¡Cambio realizado!",
                `El cargo y salario de ${employee.firstName} ${employee.lastName} fueron actualizados exitosamente.`,
                [{ text: "Ver detalle", onPress: () => router.replace("/(tabs)/(employer)/employees") }]
            );
        } catch (err) {
            console.error("Error changeSalaryPosition:", err);
            Alert.alert("Error", "No se pudo actualizar el cargo y salario. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <KeyboardAvoidingView
                behavior= "position"
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>Cambiar cargo y salario</Text>
                    <Text style={styles.subtitle}>
                        {employee.firstName} {employee.lastName}
                    </Text>

                    <Text style={styles.sectionTitle}>Valores actuales</Text>
                    <View style={styles.readonlyInput}>
                        <Text style={styles.readonlyLabel}>Cargo actual</Text>
                        <Text style={styles.readonlyValue}>{employee.position}</Text>
                    </View>
                    <View style={styles.readonlyInput}>
                        <Text style={styles.readonlyLabel}>Salario actual</Text>
                        <Text style={styles.readonlyValue}>
                            {new Intl.NumberFormat("es-CO", {
                                style: "currency",
                                currency: "COP",
                                maximumFractionDigits: 0,
                            }).format(employee.baseSalary)}
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Nuevos valores</Text>

                    <Text style={styles.label}>Nuevo cargo *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            errors.position && styles.inputError,
                            focusedField === "position" && styles.inputFocused,
                        ]}
                        value={form.position}
                        onChangeText={(v) => handleChange("position", v)}
                        onFocus={() => setFocusedField("position")}
                        onBlur={() => setFocusedField(null)}
                    />
                    {errors.position && <Text style={styles.errorText}>{errors.position}</Text>}

                    <Text style={styles.label}>Nuevo salario base (COP) *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            errors.baseSalary && styles.inputError,
                            focusedField === "baseSalary" && styles.inputFocused,
                        ]}
                        value={form.baseSalary}
                        onChangeText={(v) => handleChange("baseSalary", v)}
                        keyboardType="numeric"
                        onFocus={() => setFocusedField("baseSalary")}
                        onBlur={() => setFocusedField(null)}
                    />
                    {errors.baseSalary && <Text style={styles.errorText}>{errors.baseSalary}</Text>}

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
            </KeyboardAvoidingView>
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
    readonlyInput: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#F9FAFB",
        marginBottom: 8,
    },
    readonlyLabel: {
        fontSize: 13,
        color: "#6B7280",
    },
    readonlyValue: {
        fontSize: 13,
        color: "#374151",
        fontWeight: "500",
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
