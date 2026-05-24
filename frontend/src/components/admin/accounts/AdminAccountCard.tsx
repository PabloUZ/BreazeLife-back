import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { AdminAccountListItemDto } from "@/src/dtos/admin/admin.dtos";
import {
  getAccountDisplayName,
  getAccountIdentifier,
  getRoleLabel,
  getStatusColors,
  getStatusLabel,
  getVerificationColors,
  getVerificationLabel,
} from "@/src/components/admin/accounts/accountUtils";

type AdminAccountCardProps = {
  account: AdminAccountListItemDto;
  onPress: () => void;
};

export default function AdminAccountCard({
  account,
  onPress,
}: AdminAccountCardProps) {
  const statusColors = getStatusColors(account.status);
  const verificationColors = getVerificationColors(account.verified);
  const identifier = getAccountIdentifier(account);
  const displayName = getAccountDisplayName(account);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{account.email}</Text>
          {account.role === "EMPLOYER" ? (
            <Text style={styles.secondaryName}>
              Responsable: {account.firstName} {account.lastName}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.tagsRow}>
        <View style={styles.neutralPill}>
          <Text style={styles.neutralPillText}>{getRoleLabel(account.role)}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: statusColors.backgroundColor },
          ]}
        >
          <Text style={[styles.statusPillText, { color: statusColors.color }]}>
            {getStatusLabel(account.status)}
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: verificationColors.backgroundColor },
          ]}
        >
          <Text
            style={[styles.statusPillText, { color: verificationColors.color }]}
          >
            {getVerificationLabel(account.verified)}
          </Text>
        </View>
      </View>

      <View style={styles.identifierCard}>
        <Text style={styles.identifierLabel}>
          {account.role === "AFFILIATE" ? "Documento" : "NIT"}
        </Text>
        <Text style={styles.identifierValue}>{identifier ?? "N/A"}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.detailLink}>Ver detalle</Text>
        <Ionicons name="chevron-forward" size={18} color="#369BC9" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5EEF5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#369BC9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerInfo: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  email: {
    fontSize: 13,
    color: "#4B5563",
  },
  secondaryName: {
    fontSize: 12,
    color: "#6B7280",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  neutralPill: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  neutralPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  identifierCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  identifierLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  identifierValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#369BC9",
  },
});
