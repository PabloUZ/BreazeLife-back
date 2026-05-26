import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
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

function DetailField({
  label,
  muted,
  value,
}: {
  label: string;
  muted?: boolean;
  value: string;
}) {
  return (
    <View style={styles.fieldCard}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, muted && styles.fieldValueMuted]}>
        {value}
      </Text>
    </View>
  );
}

function DetailSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
      <View style={styles.fieldsList}>{children}</View>
    </View>
  );
}

export default function AdminAccountDetail({
  account,
}: AdminAccountDetailProps) {
  const statusColors = getStatusColors(account.status);
  const verificationColors = getVerificationColors(account.verified);
  const displayName = getAccountDisplayName(account);
  const supportingText =
    account.role === "EMPLOYER"
      ? `${account.firstName} ${account.lastName}`.trim()
      : account.affiliate?.document || "Afiliado";

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.eyebrow}>Cuenta administrada</Text>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.subtitle}>{account.email}</Text>
        <Text style={styles.supportingText}>{supportingText}</Text>

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

        {account.suspendedReason ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeLabel}>Motivo de suspension</Text>
            <Text style={styles.noticeValue}>{account.suspendedReason}</Text>
          </View>
        ) : null}
      </View>

      <DetailSection
        title="Datos del usuario"
        description="Informacion base de la cuenta administrada."
      >
        <DetailField label="Correo" value={account.email} />
        <DetailField label="ID de usuario" value={account.userId} />
        <DetailField label="Rol" value={getRoleLabel(account.role)} />
        <DetailField label="Estado" value={getStatusLabel(account.status)} />
        <DetailField
          label="Verificacion"
          value={getVerificationLabel(account.verified)}
        />
      </DetailSection>

      {account.role === "AFFILIATE" && account.affiliate ? (
        <DetailSection
          title="Datos del afiliado"
          description="Campos personales y de afiliacion asociados al usuario."
        >
          <DetailField label="Documento" value={account.affiliate.document || "N/A"} />
          <DetailField
            label="Fecha de nacimiento"
            muted={formatDate(account.affiliate.birthDate) === "N/A"}
            value={formatDate(account.affiliate.birthDate)}
          />
          <DetailField
            label="Telefono"
            muted={!account.affiliate.phoneNumber}
            value={account.affiliate.phoneNumber || "N/A"}
          />
          <DetailField
            label="Fecha de afiliacion"
            muted={formatDate(account.affiliate.affiliationDate) === "N/A"}
            value={formatDate(account.affiliate.affiliationDate)}
          />
        </DetailSection>
      ) : null}

      {account.role === "EMPLOYER" && account.employer ? (
        <DetailSection
          title="Datos del empleador"
          description="Informacion legal y operativa disponible para esta empresa."
        >
          <DetailField label="NIT" value={account.employer.nit || "N/A"} />
          <DetailField
            label="Empresa"
            value={account.employer.companyName || "N/A"}
          />
          <DetailField
            label="Sector"
            muted={!account.employer.sector}
            value={account.employer.sector || "N/A"}
          />
          <DetailField
            label="Representante legal"
            muted={!account.employer.nameLegalRep}
            value={account.employer.nameLegalRep || "N/A"}
          />
          <DetailField
            label="ID representante"
            muted={!account.employer.idLegalRep}
            value={account.employer.idLegalRep || "N/A"}
          />
        </DetailSection>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5EEF5",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#369BC9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#369BC9",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
  },
  supportingText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
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
  noticeCard: {
    width: "100%",
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 4,
  },
  noticeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#991B1B",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  noticeValue: {
    fontSize: 14,
    color: "#7F1D1D",
    lineHeight: 20,
  },
  section: {
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
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
  },
  fieldsList: {
    gap: 10,
    marginTop: 6,
  },
  fieldCard: {
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    padding: 14,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  fieldValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    lineHeight: 20,
  },
  fieldValueMuted: {
    color: "#6B7280",
    fontWeight: "500",
  },
});
