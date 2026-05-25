import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import type { LoginResponseDto } from "@/src/dtos/auth/auth.dtos";
import { login } from "@/src/services/api/authService";
import { colors, formStyles, spacing, typography } from "@/src/theme";

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

  if (!form.email.trim()) {
    errors.email = "El correo es requerido";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Correo invalido";
  }

  if (!form.password) {
    errors.password = "La contrasena es requerida";
  } else if (form.password.length < 8) {
    errors.password = "Minimo 8 caracteres";
  }

  return errors;
}

export default function LoginForm({ onSuccess }: Props) {
  const [form, setForm] = useState<FormFields>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof FormFields | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(field: keyof FormFields, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setApiError(null);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit() {
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
        setApiError("Tu cuenta no esta activada. Revisa tu correo.");
      } else if (apiErr.message_code === "INVALID_CREDENTIALS") {
        setApiError("Correo o contrasena incorrectos.");
      } else {
        setApiError(apiErr.message ?? "Error al iniciar sesion. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>Iniciar sesion</Text>
      <Text style={styles.subtitle}>Accede a BreazeLife con tu cuenta.</Text>

      {apiError ? (
        <View style={styles.apiErrorBox}>
          <Text style={styles.apiErrorText}>{apiError}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Correo electronico</Text>
      <TextInput
        style={[
          styles.input,
          focusedField === "email" ? styles.inputFocused : null,
          errors.email ? styles.inputError : null,
        ]}
        placeholder="correo@ejemplo.com"
        placeholderTextColor={colors.textSubtle}
        value={form.email}
        onChangeText={(value) => handleChange("email", value)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        onFocus={() => setFocusedField("email")}
        onBlur={() => setFocusedField(null)}
      />
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

      <Text style={styles.label}>Contrasena</Text>
      <View style={styles.passwordWrapper}>
        <TextInput
          style={[
            styles.input,
            styles.passwordInput,
            focusedField === "password" ? styles.inputFocused : null,
            errors.password ? styles.inputError : null,
          ]}
          placeholder="Minimo 8 caracteres"
          placeholderTextColor={colors.textSubtle}
          value={form.password}
          onChangeText={(value) => handleChange("password", value)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          onFocus={() => setFocusedField("password")}
          onBlur={() => setFocusedField(null)}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <Text style={styles.eyeText}>{showPassword ? "Ocultar" : "Ver"}</Text>
        </TouchableOpacity>
      </View>
      {errors.password ? (
        <Text style={styles.errorText}>{errors.password}</Text>
      ) : null}

      <AppButton
        title="Ingresar"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  apiErrorBox: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  apiErrorText: {
    ...typography.caption,
    color: colors.dangerText,
  },
  label: formStyles.label,
  input: formStyles.input,
  inputFocused: formStyles.inputFocused,
  inputError: formStyles.inputError,
  passwordWrapper: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 72,
  },
  eyeButton: {
    position: "absolute",
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  eyeText: {
    ...typography.caption,
    color: colors.primary,
  },
  errorText: formStyles.errorText,
  submitButton: {
    marginTop: spacing.xxl,
  },
});
