import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import type { UserRole } from "@/src/dtos/auth/auth.dtos";
import { signup } from "@/src/services/api/authService";
import { colors, formStyles, spacing, typography } from "@/src/theme";

const FIELD_LABELS: Record<string, string> = {
  first_name: "Nombre",
  last_name: "Apellido",
  email: "Correo electronico",
  password: "Contrasena",
  confirmPassword: "Confirmar contrasena",
  role: "Tipo de cuenta",
};

function translateDetail(raw: string): string {
  if (raw.includes("must not be blank") || raw.includes("must not be null")) {
    return "Campo requerido";
  }
  if (raw.includes("well-formed email")) {
    return "Correo electronico invalido";
  }
  if (raw.includes("size must be between 8")) {
    return "Minimo 8 caracteres";
  }
  if (raw.includes("size must be between 1") && raw.includes("30")) {
    return "Debe tener entre 1 y 30 caracteres";
  }
  return raw;
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

function validateForm(form: FormFields): FormErrors {
  const errors: FormErrors = {};

  if (!form.first_name.trim()) {
    errors.first_name = "El nombre es requerido";
  } else if (form.first_name.trim().length > 30) {
    errors.first_name = "Maximo 30 caracteres";
  }

  if (!form.last_name.trim()) {
    errors.last_name = "El apellido es requerido";
  } else if (form.last_name.trim().length > 30) {
    errors.last_name = "Maximo 30 caracteres";
  }

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

  if (!form.confirmPassword) {
    errors.confirmPassword = "Confirma tu contrasena";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Las contrasenas no coinciden";
  }

  return errors;
}

export default function SignupForm({ onSuccess }: Props) {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [form, setForm] = useState<FormFields>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof FormFields | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

      await signup({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      onSuccess();
    } catch (error: unknown) {
      const apiErr = error as {
        message?: string;
        message_code?: string;
        details?: Record<string, string>;
      };

      if (apiErr.message_code === "INVALID_INPUT" && apiErr.details) {
        setErrors((prev) => ({ ...prev, ...mapApiDetails(apiErr.details ?? {}) }));
      } else if (apiErr.message_code === "EMAIL_ALREADY_EXISTS") {
        setApiError("Ya existe una cuenta con este correo.");
      } else {
        setApiError(apiErr.message ?? "Error al registrarse. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppCard style={[styles.card, isCompact ? styles.cardCompact : styles.cardRegular]}>
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Completa tus datos para registrarte.</Text>

      {apiError ? (
        <View style={styles.apiErrorBox}>
          <Text style={styles.apiErrorText}>{apiError}</Text>
        </View>
      ) : null}

      <View style={[styles.row, isCompact ? styles.rowStack : null]}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === "first_name" ? styles.inputFocused : null,
              errors.first_name ? styles.inputError : null,
            ]}
            placeholder="Ej: Juan"
            placeholderTextColor={colors.textSubtle}
            value={form.first_name}
            onChangeText={(value) => handleChange("first_name", value)}
            autoCapitalize="words"
            onFocus={() => setFocusedField("first_name")}
            onBlur={() => setFocusedField(null)}
          />
          {errors.first_name ? (
            <Text style={styles.errorText}>{errors.first_name}</Text>
          ) : null}
        </View>

        <View style={styles.halfField}>
          <Text style={styles.label}>Apellido *</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === "last_name" ? styles.inputFocused : null,
              errors.last_name ? styles.inputError : null,
            ]}
            placeholder="Ej: Perez"
            placeholderTextColor={colors.textSubtle}
            value={form.last_name}
            onChangeText={(value) => handleChange("last_name", value)}
            autoCapitalize="words"
            onFocus={() => setFocusedField("last_name")}
            onBlur={() => setFocusedField(null)}
          />
          {errors.last_name ? (
            <Text style={styles.errorText}>{errors.last_name}</Text>
          ) : null}
        </View>
      </View>

      <Text style={styles.label}>Correo electronico *</Text>
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

      <Text style={styles.label}>Contrasena *</Text>
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

      <Text style={styles.label}>Confirmar contrasena *</Text>
      <View style={styles.passwordWrapper}>
        <TextInput
          style={[
            styles.input,
            styles.passwordInput,
            focusedField === "confirmPassword" ? styles.inputFocused : null,
            errors.confirmPassword ? styles.inputError : null,
          ]}
          placeholder="Repite tu contrasena"
          placeholderTextColor={colors.textSubtle}
          value={form.confirmPassword}
          onChangeText={(value) => handleChange("confirmPassword", value)}
          secureTextEntry={!showConfirm}
          autoCapitalize="none"
          onFocus={() => setFocusedField("confirmPassword")}
          onBlur={() => setFocusedField(null)}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowConfirm((prev) => !prev)}
        >
          <Text style={styles.eyeText}>{showConfirm ? "Ocultar" : "Ver"}</Text>
        </TouchableOpacity>
      </View>
      {errors.confirmPassword ? (
        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
      ) : null}

      <Text style={[styles.label, styles.roleLabel]}>Tipo de cuenta *</Text>
      <View style={[styles.roleOptions, isCompact ? styles.roleOptionsCompact : null]}>
        {ROLE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.roleChip,
              isCompact ? styles.roleChipCompact : null,
              form.role === option.value ? styles.roleChipActive : null,
            ]}
            onPress={() => setForm((prev) => ({ ...prev, role: option.value }))}
          >
            <Text
              style={[
                styles.roleChipText,
                form.role === option.value ? styles.roleChipTextActive : null,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <AppButton
        title="Crear cuenta"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 2,
  },
  cardRegular: {
    padding: spacing.md,
  },
  cardCompact: {
    padding: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
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
  row: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: 0,
  },
  rowStack: {
    flexDirection: "column",
    gap: 0,
  },
  halfField: {
    flex: 1,
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
  roleOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  roleOptionsCompact: {
    gap: spacing.sm,
  },
  roleLabel: {
    marginTop: spacing.sm,
  },
  roleChip: formStyles.chip,
  roleChipCompact: {
    minWidth: "46%",
    alignItems: "center",
  },
  roleChipActive: formStyles.chipActive,
  roleChipText: formStyles.chipText,
  roleChipTextActive: formStyles.chipTextActive,
  submitButton: {
    marginTop: spacing.lg,
  },
});
