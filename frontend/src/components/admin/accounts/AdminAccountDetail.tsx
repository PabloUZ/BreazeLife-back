import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { AdminAccountDetailDto } from "@/src/dtos/admin/admin.dtos";
import {
  formatDate,
  getAccountDisplayName,
  getRoleLabel,
  getStatusColors,
  getStatusLabel,
  getVerificationColors,
  getVerificationLabel,
} from "@/src/components/admin/accounts/accountUtils";

type AdminAccountDetailProps = {
  account: AdminAccountDetailDto;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function AdminAccountDetail({
  account,
}: AdminAccountDetailProps) {
  const statusColors = getStatusColors(account.status);
  const verificationColors = getVerificationColors(account.verified);
  const displayName = getAccountDisplayName(account);
  const subtitle =
    account.role === "EMPLOYER"
      ? `${account.firstName} ${account.lastName}`.trim()
      : account.email;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.pillsRow}>
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
      </View>

      <DetailSection title="Informacion general">
        <DetailRow label="Correo" value={account.email} />
        <DetailRow label="ID de usuario" value={account.userId} />
        <DetailRow label="Rol" value={getRoleLabel(account.role)} />
        <DetailRow label="Estado" value={getStatusLabel(account.status)} />
        <DetailRow
          label="Verificacion"
          value={getVerificationLabel(account.verified)}
        />
        <DetailRow
          label="Motivo de suspension"
          value={account.suspendedReason || "N/A"}
        />
      </DetailSection>

      {account.role === "AFFILIATE" && account.affiliate && (
        <DetailSection title="Datos del afiliado">
          <DetailRow label="Documento" value={account.affiliate.document || "N/A"} />
          <DetailRow
            label="Fecha de nacimiento"
            value={formatDate(account.affiliate.birthDate)}
          />
          <DetailRow
            label="Telefono"
            value={account.affiliate.phoneNumber || "N/A"}
          />
          <DetailRow
            label="Fecha de afiliacion"
            value={formatDate(account.affiliate.affiliationDate)}
          />
        </DetailSection>
      )}

      {account.role === "EMPLOYER" && account.employer && (
        <DetailSection title="Datos del empleador">
          <DetailRow label="NIT" value={account.employer.nit || "N/A"} />
          <DetailRow
            label="Empresa"
            value={account.employer.companyName || "N/A"}
          />
          <DetailRow label="Sector" value={account.employer.sector || "N/A"} />
          <DetailRow
            label="Representante legal"
            value={account.employer.nameLegalRep || "N/A"}
          />
          <DetailRow
            label="ID representante"
            value={account.employer.idLegalRep || "N/A"}
          />
        </DetailSection>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#369BC9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    textAlign: "center",
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  neutralPill: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  neutralPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  rowLabel: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },
  rowValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
});
