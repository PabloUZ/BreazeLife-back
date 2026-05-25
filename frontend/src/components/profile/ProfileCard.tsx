import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import { useAuthContext } from "@/src/context/AuthContext";
import { colors, radius, shadows, spacing, typography } from "@/src/theme";

const ROLE_LABELS: Record<string, string> = {
  affiliate: "Afiliado",
  employer: "Empleador",
  admin: "Administrador",
  guest: "Invitado",
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

type InfoRowProps = {
  label: string;
  value: string;
  mono?: boolean;
  valueColor?: string;
};

function Divider() {
  return <View style={styles.divider} />;
}

function InfoRow({ label, value, mono, valueColor }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          mono ? styles.infoValueMono : null,
          valueColor ? { color: valueColor } : null,
        ]}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {value}
      </Text>
    </View>
  );
}

export default function ProfileCard() {
  const { state, signOut } = useAuthContext();
  const router = useRouter();

  const user = state.user;
  if (!user) {
    return null;
  }

  const initials = getInitials(user.first_name, user.last_name);
  const roleLabel = ROLE_LABELS[state.role] ?? state.role;

  function handleLogout() {
    Alert.alert("Cerrar sesion", "Estas seguro de que deseas cerrar sesion?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesion",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {user.verified ? <View style={styles.verifiedDot} /> : null}
        </View>

        <View style={styles.identityBlock}>
          <Text style={styles.name}>
            {user.first_name} {user.last_name}
          </Text>
          <AppStatusBadge label={roleLabel} tone="info" style={styles.roleBadge} />
        </View>
      </View>

      <AppCard style={styles.infoCard}>
        <InfoRow label="Correo electronico" value={user.email} />
        <Divider />
        <InfoRow label="ID de cuenta" value={user.user_id} mono />
        <Divider />
        <InfoRow
          label="Estado"
          value={user.verified ? "Verificada" : "Sin verificar"}
          valueColor={user.verified ? colors.successText : colors.dangerText}
        />
      </AppCard>

      <AppButton
        title="Cerrar sesion"
        variant="danger"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.lg,
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  heroCard: {
    width: "100%",
    alignSelf: "stretch",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.xxl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.primaryText,
    letterSpacing: 1,
  },
  verifiedDot: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  name: {
    ...typography.sectionTitle,
    color: colors.text,
    textAlign: "center",
  },
  identityBlock: {
    alignItems: "center",
    gap: spacing.xs,
    width: "100%",
  },
  roleBadge: {
    alignSelf: "center",
  },
  infoCard: {
    width: "100%",
    alignSelf: "stretch",
    paddingVertical: 4,
  },
  infoRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textMuted,
    flexShrink: 0,
  },
  infoValue: {
    ...typography.bodyStrong,
    color: colors.text,
    flexShrink: 1,
    textAlign: "right",
  },
  infoValueMono: {
    fontFamily: "monospace",
    fontSize: 12,
    color: colors.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderMuted,
    marginHorizontal: spacing.lg,
  },
  logoutButton: {
    width: "100%",
    alignSelf: "stretch",
  },
});
