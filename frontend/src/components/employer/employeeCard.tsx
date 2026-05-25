import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppCard from "@/src/components/common/AppCard";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import type { EmployerEmployeeDto } from "@/src/dtos/employer/employee.dtos";
import { colors, spacing, typography } from "@/src/theme";

type EmployeeCardProps = {
  employee: EmployerEmployeeDto;
  onPress?: () => void;
};

function formatSalary(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

export default function EmployeeCard({ employee, onPress }: EmployeeCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82}>
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {employee.firstName.charAt(0).toUpperCase()}
              {employee.lastName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
              {employee.firstName} {employee.lastName}
            </Text>
            <Text style={styles.position} numberOfLines={2} ellipsizeMode="tail">
              {employee.position}
            </Text>
          </View>

          <AppStatusBadge
            label={employee.status === "ACTIVE" ? "Activo" : "Inactivo"}
            tone={employee.status === "ACTIVE" ? "success" : "danger"}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Salario</Text>
            <Text style={styles.footerValue}>{formatSalary(employee.baseSalary)}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Ingreso</Text>
            <Text style={styles.footerValue}>{formatDate(employee.startDate)}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Documento</Text>
            <Text style={styles.footerValue} numberOfLines={1} ellipsizeMode="tail">
              {employee.document}
            </Text>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceTint,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  position: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  footerItem: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 92,
  },
  footerLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: 2,
  },
  footerValue: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.neutralText,
  },
});
