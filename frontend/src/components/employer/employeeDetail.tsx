import { ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppHeader from "@/src/components/common/AppHeader";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import type { EmployeeDetailDto } from "@/src/dtos/employer/employee.dtos";
import { colors, spacing, typography } from "@/src/theme";

type EmployeeDetailProps = {
  employee: EmployeeDetailDto;
  onBack: () => void;
  onEdit: () => void;
  onViewHistory: () => void;
};

function formatSalary(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "No disponible";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={styles.infoValue}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {value}
      </Text>
    </View>
  );
}

export default function EmployeeDetail({
  employee,
  onBack,
  onEdit,
  onViewHistory,
}: EmployeeDetailProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <AppButton
          title="Volver"
          variant="secondary"
          iconName="arrow-back-outline"
          onPress={onBack}
        />
      </View>

      <AppHeader
        title="Detalle del empleado"
        subtitle="Consulta los datos personales, laborales y de contrato del empleado."
      />

      <AppCard style={styles.heroCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {employee.firstName.charAt(0).toUpperCase()}
            {employee.lastName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>
          {employee.firstName} {employee.lastName}
        </Text>
        <Text style={styles.position}>{employee.position}</Text>
        <AppStatusBadge
          label={employee.status === "ACTIVE" ? "Activo" : "Inactivo"}
          tone={employee.status === "ACTIVE" ? "success" : "danger"}
        />

        <View style={styles.actions}>
          <AppButton title="Editar informacion" onPress={onEdit} style={styles.actionButton} />
          <AppButton
            title="Historial salarial"
            variant="secondary"
            onPress={onViewHistory}
            style={styles.actionButton}
          />
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>Datos personales</Text>
        <InfoRow label="Correo" value={employee.email} />
        <InfoRow label="Documento" value={employee.document} />
        <InfoRow label="Fecha de nacimiento" value={formatDate(employee.birthDate)} />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>Datos laborales</Text>
        <InfoRow label="Empresa" value={employee.companyName} />
        <InfoRow label="Cargo" value={employee.position} />
        <InfoRow label="Salario base" value={formatSalary(employee.baseSalary)} />
        <InfoRow label="Fecha de vinculacion" value={formatDate(employee.startDate)} />
        <InfoRow label="Fecha de retiro" value={formatDate(employee.endDate)} />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>Contrato</Text>
        <InfoRow label="ID contrato" value={employee.contractId} />
        <InfoRow label="ID afiliado" value={employee.affiliateId} />
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  topBar: {
    alignItems: "flex-start",
  },
  heroCard: {
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  avatarText: {
    color: colors.primaryText,
    fontSize: 28,
    fontWeight: "700",
  },
  name: {
    ...typography.sectionTitle,
    color: colors.text,
    textAlign: "center",
  },
  position: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    width: "100%",
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSubtle,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
  },
  infoValue: {
    ...typography.bodyStrong,
    color: colors.text,
    flex: 1.2,
    textAlign: "right",
  },
});
