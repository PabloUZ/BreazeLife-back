import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { AdminAccountDetailDto } from "@/src/dtos/admin/admin.dtos";

type AdminAccountActionsProps = {
  actionLoading: boolean;
  account: AdminAccountDetailDto;
  onActivate: () => void;
  onOpenSuspend: () => void;
  onVerify: () => void;
};

type ActionTone = "primary" | "danger" | "success";

function ActionButton({
  description,
  disabled,
  label,
  loading,
  onPress,
  tone,
}: {
  description: string;
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
  tone: ActionTone;
}) {
  const toneStyles =
    tone === "danger"
      ? {
          backgroundColor: "#FEF2F2",
          borderColor: "#FECACA",
          titleColor: "#B91C1C",
          descriptionColor: "#991B1B",
          spinnerColor: "#B91C1C",
        }
      : tone === "success"
        ? {
            backgroundColor: "#ECFDF5",
            borderColor: "#A7F3D0",
            titleColor: "#166534",
            descriptionColor: "#047857",
            spinnerColor: "#166534",
          }
        : {
            backgroundColor: "#EFF6FF",
            borderColor: "#BFDBFE",
            titleColor: "#1D4ED8",
            descriptionColor: "#1E40AF",
            spinnerColor: "#1D4ED8",
          };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: toneStyles.backgroundColor,
          borderColor: toneStyles.borderColor,
        },
        disabled && styles.buttonDisabled,
      ]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <Text style={[styles.buttonTitle, { color: toneStyles.titleColor }]}>
          {label}
        </Text>
        <Text
          style={[
            styles.buttonDescription,
            { color: toneStyles.descriptionColor },
          ]}
        >
          {description}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={toneStyles.spinnerColor} />
      ) : (
        <Text style={[styles.buttonCta, { color: toneStyles.titleColor }]}>
          Abrir
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function AdminAccountActions({
  actionLoading,
  account,
  onActivate,
  onOpenSuspend,
  onVerify,
}: AdminAccountActionsProps) {
  const canVerify = !account.verified;
  const canSuspend = account.status === "ACTIVE";
  const canActivate = account.status === "SUSPENDED";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acciones de cuenta</Text>
      <Text style={styles.subtitle}>
        Usa estas acciones para validar o cambiar el estado operativo de la
        cuenta sin salir del detalle.
      </Text>

      <View style={styles.actionsList}>
        {canVerify ? (
          <ActionButton
            description="Confirma la cuenta para que quede marcada como verificada."
            disabled={actionLoading}
            label="Verificar cuenta"
            loading={actionLoading}
            onPress={onVerify}
            tone="primary"
          />
        ) : null}

        {canSuspend ? (
          <ActionButton
            description="Bloquea temporalmente la cuenta y permite registrar un motivo."
            disabled={actionLoading}
            label="Suspender cuenta"
            loading={actionLoading}
            onPress={onOpenSuspend}
            tone="danger"
          />
        ) : null}

        {canActivate ? (
          <ActionButton
            description="Restaura la cuenta suspendida para que vuelva a estar activa."
            disabled={actionLoading}
            label="Activar cuenta"
            loading={actionLoading}
            onPress={onActivate}
            tone="success"
          />
        ) : null}

        {!canVerify && !canSuspend && !canActivate ? (
          <Text style={styles.noActionsText}>
            No hay acciones disponibles para el estado actual de esta cuenta.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5EEF5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
  },
  actionsList: {
    gap: 12,
    marginTop: 6,
  },
  button: {
    minHeight: 72,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  buttonContent: {
    flex: 1,
    gap: 4,
  },
  buttonTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  buttonDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttonCta: {
    fontSize: 13,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  noActionsText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
  },
});
