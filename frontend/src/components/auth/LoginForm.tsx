import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { login } from "@/src/services/api/authService";
import type { LoginResponseDto } from "@/src/dtos/auth/auth.dtos";

type Props = {
    onSuccess: (data: LoginResponseDto["data"]) => void;
};

type FormFields = {
    email: string;
    password: string;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

const INITIAL_FORM: FormFields = { email: "", password: "" };

function validateForm(form: FormFields): FormErrors {
    const errors: FormErrors = {};
    if (!form.email.trim())
        errors.email = "El correo es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errors.email = "Correo inválido";
    if (!form.password)
        errors.password = "La contraseña es requerida";
    else if (form.password.length < 8)
        errors.password = "Mínimo 8 caracteres";
    return errors;
}

export default function LoginForm({ onSuccess }: Props) {
    const [form, setForm] = useState<FormFields>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<keyof FormFields | null>(null);
    const [showPassword, setShowPassword] = useState(false);

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
            const response = await login({
                email: form.email.trim(),
                password: form.password,
            });
            onSuccess(response.data);
        } catch (error: unknown) {
            const apiErr = error as { message?: string; message_code?: string };
            if (apiErr.message_code === "ACCOUNT_NOT_VERIFIED") {
                setApiError("Tu cuenta no está activada. Revisa tu correo.");
            } else if (apiErr.message_code === "INVALID_CREDENTIALS") {
                setApiError("Correo o contraseña incorrectos.");
            } else {
                setApiError(apiErr.message ?? "Error al iniciar sesión. Intenta de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar sesión</Text>
            <Text style={styles.subtitle}>Bienvenido de nuevo</Text>

            {apiError && (
                <View style={styles.apiErrorBox}>
                    <Text style={styles.apiErrorText}>{apiError}</Text>
                </View>
            )}

            <Text style={styles.label}>Correo electrónico</Text>
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

            <Text style={styles.label}>Contraseña</Text>
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

            <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.submitButtonText}>Ingresar</Text>
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
