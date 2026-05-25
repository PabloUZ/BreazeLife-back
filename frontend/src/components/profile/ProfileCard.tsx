import { useRouter } from "expo-router";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthContext } from "@/src/context/AuthContext";

const ROLE_LABELS: Record<string, string> = {
  affiliate: "Afiliado",
  employer:  "Empleador",
  admin:     "Administrador",
  guest:     "Invitado",
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function ProfileCard() {
  const { state, signOut } = useAuthContext();
  const router = useRouter();

  const user = state.user;
  if (!user) return null;

  const initials  = getInitials(user.first_name, user.last_name);
  const roleLabel = ROLE_LABELS[state.role] ?? state.role;

  function handleLogout() {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {user.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedIcon}>✓</Text>
          </View>
        )}
      </View>

      {/* Nombre */}
      <Text style={styles.name}>
        {user.first_name} {user.last_name}
      </Text>

      {/* Rol */}
      <View style={styles.rolePill}>
        <Text style={styles.roleText}>{roleLabel}</Text>
      </View>

      {/* Info de la cuenta */}
      <View style={styles.card}>
        <InfoRow label="Correo electrónico" value={user.email} />
        <Divider />
        <InfoRow label="ID de cuenta" value={user.user_id} mono />
        <Divider />
        <InfoRow
          label="Estado de cuenta"
          value={user.verified ? "Verificada" : "Sin verificar"}
          valueColor={user.verified ? "#16A34A" : "#DC2626"}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider() {
  return <View style={styles.divider} />;
}

type InfoRowProps = {
  label: string;
  value: string;
  mono?: boolean;
  valueColor?: string;
};

function InfoRow({ label, value, mono, valueColor }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          mono && styles.infoValueMono,
          valueColor ? { color: valueColor } : undefined,
        ]}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    backgroundColor: "#F9FAFB",
  },

  // Avatar
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#369BC9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#16A34A",
    borderWidth: 2,
    borderColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedIcon: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // Name & role
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  rolePill: {
    backgroundColor: "#EBF5FB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 28,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#369BC9",
  },

  // Info card
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flexShrink: 1,
    textAlign: "right",
  },
  infoValueMono: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#6B7280",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 20,
  },

  // Logout
  logoutButton: {
    width: "100%",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626",
  },
});
