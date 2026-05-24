import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { signup } from "@/src/services/api/authService";
import type { UserRole } from "@/src/dtos/auth/auth.dtos";

// Traduce los mensajes de validación de Spring Boot al español
const FIELD_LABELS: Record<string, string> = {
    first_name:      "Nombre",
    last_name:       "Apellido",
    email:           "Correo electrónico",
    password:        "Contraseña",
    confirmPassword: "Confirmar contraseña",
    role:            "Tipo de cuenta",
};

function translateDetail(raw: string): string {
    if (raw.includes("must not be blank") || raw.includes("must not be null"))
        return "Campo requerido";
    if (raw.includes("well-formed email"))
        return "Correo electrónico inválido";
    if (raw.includes("size must be between 8"))
        return "Mínimo 8 caracteres";
    if (raw.includes("size must be between 1") && raw.includes("30"))
        return "Debe tener entre 1 y 30 caracteres";
    // fallback: devolver el mensaje original
    return raw;
}

function mapApiDetails(
    details: Record<string, string>
): Partial<Record<keyof FormFields, string>> {
    const mapped: Partial<Record<keyof FormFields, string>> = {};
    for (const [field, message] of Object.entries(details)) {
        if (field in FIELD_LABELS) {
            mapped[field as keyof FormFields] = translateDetail(message);
        }
    }
    return mapped;
}

type Props = {
    onSuccess: () => void;
};

type FormFields = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

const INITIAL_FORM: FormFields = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "AFFILIATE",
};

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
    { label: "Afiliado", value: "AFFILIATE" },
    { label: "Empleador", value: "EMPLOYER" },
    { label: "Administrador", value: "ADMIN" },
];

function validateForm(form: FormFields): FormErrors {
    const errors: FormErrors = {};
    if (!form.first_name.trim())
        errors.first_name = "El nombre es requerido";
    else if (form.first_name.trim().length > 30)
        errors.first_name = "Máximo 30 caracteres";
    if (!form.last_name.trim())
        errors.last_name = "El apellido es requerido";
    else if (form.last_name.trim().length > 30)
        errors.last_name = "Máximo 30 caracteres";
    if (!form.email.trim())
        errors.email = "El correo es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errors.email = "Correo inválido";
    if (!form.password)
        errors.password = "La contraseña es requerida";
    else if (form.password.length < 8)
        errors.password = "Mínimo 8 caracteres";
    if (!form.confirmPassword)
        errors.confirmPassword = "Confirma tu contraseña";
    else if (form.password !== form.confirmPassword)
        errors.confirmPassword = "Las contraseñas no coinciden";
    return errors;
}

export default function SignupForm({ onSuccess }: Props) {
    const [form, setForm] = useState<FormFields>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<keyof FormFields | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (field: keyof FormFields, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setApiError(null);
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
            setApiError(null);
            await signup({
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role,
            });
            onSuccess();
        } catch (error: unknown) {
            const apiErr = error as { message?: string; message_code?: string; details?: Record<string, string> };
            if (apiErr.message_code === "INVALID_INPUT" && apiErr.details) {
                // Muestra los errores por campo directamente en el formulario
                setErrors((prev) => ({ ...prev, ...mapApiDetails(apiErr.details!) }));
            } else if (apiErr.message_code === "EMAIL_ALREADY_EXISTS") {
                setApiError("Ya existe una cuenta con este correo.");
            } else {
                setApiError(apiErr.message ?? "Error al registrarse. Intenta de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>

            {apiError && (
                <View style={styles.apiErrorBox}>
                    <Text style={styles.apiErrorText}>{apiError}</Text>
                </View>
            )}

            {/* Nombre y apellido */}
            <View style={styles.row}>
                <View style={styles.halfField}>
                    <Text style={styles.label}>Nombre *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            errors.first_name && styles.inputError,
                            focusedField === "first_name" && styles.inputFocused,
                        ]}
                        placeholder="Ej: Juan"
                        value={form.first_name}
                        onChangeText={(v) => handleChange("first_name", v)}
                        autoCapitalize="words"
                        onFocus={() => setFocusedField("first_name")}
                        onBlur={() => setFocusedField(null)}
                    />
                    {errors.first_name && (
                        <Text style={styles.errorText}>{errors.first_name}</Text>
                    )}
                </View>
                <View style={styles.halfField}>
                    <Text style={styles.label}>Apellido *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            errors.last_name && styles.inputError,
                            focusedField === "last_name" && styles.inputFocused,
                        ]}
                        placeholder="Ej: Pérez"
                        value={form.last_name}
                        onChangeText={(v) => handleChange("last_name", v)}
                        autoCapitalize="words"
                        onFocus={() => setFocusedField("last_name")}
                        onBlur={() => setFocusedField(null)}
                    />
                    {errors.last_name && (
                        <Text style={styles.errorText}>{errors.last_name}</Text>
                    )}
                </View>
            </View>

            {/* Correo */}
            <Text style={styles.label}>Correo electrónico *</Text>
            <TextInput
                style={[
                    styles.input,
                    errors.email && styles.inputError,
                    focusedField === "email" && styles.inputFocused,
                ]}
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChangeText={(v) => handleChange("email", v)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Contraseña */}
            <Text style={styles.label}>Contraseña *</Text>
            <View style={styles.passwordWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        styles.passwordInput,
                        errors.password && styles.inputError,
                        focusedField === "password" && styles.inputFocused,
                    ]}
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChangeText={(v) => handleChange("password", v)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((p) => !p)}
                >
                    <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            {/* Confirmar contraseña */}
            <Text style={styles.label}>Confirmar contraseña *</Text>
            <View style={styles.passwordWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        styles.passwordInput,
                        errors.confirmPassword && styles.inputError,
                        focusedField === "confirmPassword" && styles.inputFocused,
                    ]}
                    placeholder="Repite tu contraseña"
                    value={form.confirmPassword}
                    onChangeText={(v) => handleChange("confirmPassword", v)}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirm((p) => !p)}
                >
                    <Text style={styles.eyeText}>{showConfirm ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            {/* Rol */}
            <Text style={styles.label}>Tipo de cuenta *</Text>
            <View style={styles.roleOptions}>
                {ROLE_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.roleChip,
                            form.role === option.value && styles.roleChipActive,
                        ]}
                        onPress={() => setForm((prev) => ({ ...prev, role: option.value }))}
                    >
                        <Text
                            style={[
                                styles.roleChipText,
                                form.role === option.value && styles.roleChipTextActive,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.submitButtonText}>Crear cuenta</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 20,
    },
    apiErrorBox: {
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    apiErrorText: {
        fontSize: 13,
        color: "#DC2626",
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
    passwordWrapper: {
        position: "relative",
    },
    passwordInput: {
        paddingRight: 48,
    },
    eyeButton: {
        position: "absolute",
        right: 12,
        top: 0,
        bottom: 0,
        justifyContent: "center",
    },
    eyeText: {
        fontSize: 18,
    },
    errorText: {
        fontSize: 12,
        color: "#EF4444",
        marginTop: 4,
    },
    roleOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 4,
    },
    roleChip: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#F3F4F6",
        alignItems: "center",
    },
    roleChipActive: {
        backgroundColor: "#EFF6FF",
        borderColor: "#369BC9",
    },
    roleChipText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#6B7280",
    },
    roleChipTextActive: {
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
});
