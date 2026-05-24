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

function ActionButton({
  disabled,
  label,
  loading,
  onPress,
  tone,
}: {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
  tone: "primary" | "danger" | "success";
}) {
  const toneStyle =
    tone === "danger"
      ? styles.buttonDanger
      : tone === "success"
        ? styles.buttonSuccess
        : styles.buttonPrimary;

  return (
    <TouchableOpacity
      style={[styles.button, toneStyle, disabled && styles.buttonDisabled]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
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
      <View style={styles.actionsList}>
        {canVerify && (
          <ActionButton
            label="Verificar cuenta"
            onPress={onVerify}
            disabled={actionLoading}
            loading={actionLoading}
            tone="primary"
          />
        )}
        {canSuspend && (
          <ActionButton
            label="Suspender cuenta"
            onPress={onOpenSuspend}
            disabled={actionLoading}
            loading={actionLoading}
            tone="danger"
          />
        )}
        {canActivate && (
          <ActionButton
            label="Activar cuenta"
            onPress={onActivate}
            disabled={actionLoading}
            loading={actionLoading}
            tone="success"
          />
        )}
        {!canVerify && !canSuspend && !canActivate && (
          <Text style={styles.noActionsText}>
            No hay acciones disponibles para el estado actual de esta cuenta.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  actionsList: {
    gap: 10,
  },
  button: {
    minHeight: 46,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  buttonPrimary: {
    backgroundColor: "#369BC9",
  },
  buttonDanger: {
    backgroundColor: "#DC2626",
  },
  buttonSuccess: {
    backgroundColor: "#16A34A",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  noActionsText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
  },
});
