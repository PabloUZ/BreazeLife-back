import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { EmployerEmployeeDto } from "@/src/dtos/employer/employee.dtos";

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

function getStatusStyle(status: string) {
    return status === "ACTIVE" ? styles.statusActive : styles.statusInactive;
}

function getStatusLabel(status: string): string {
    return status === "ACTIVE" ? "Activo" : "Inactivo";
}

export default function EmployeeCard({ employee, onPress }: EmployeeCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {employee.firstName.charAt(0).toUpperCase()}
                        {employee.lastName.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>
                        {employee.firstName} {employee.lastName}
                    </Text>
                    <Text style={styles.position}>{employee.position}</Text>
                </View>
                <View style={[styles.statusBadge, getStatusStyle(employee.status)]}>
                    <Text style={styles.statusText}>
                        {getStatusLabel(employee.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.footer}>
                <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>Salario</Text>
                    <Text style={styles.footerValue}>
                        {formatSalary(employee.baseSalary)}
                    </Text>
                </View>
                <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>Desde</Text>
                    <Text style={styles.footerValue}>
                        {formatDate(employee.startDate)}
                    </Text>
                </View>
                <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>Cédula</Text>
                    <Text style={styles.footerValue}>{employee.document}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#4EA351",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
    position: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusActive: {
        backgroundColor: "#D1FAE5",
    },
    statusInactive: {
        backgroundColor: "#FEE2E2",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#374151",
    },
    divider: {
        height: 1,
        backgroundColor: "#F3F4F6",
        marginVertical: 12,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerItem: {
        alignItems: "center",
    },
    footerLabel: {
        fontSize: 11,
        color: "#9CA3AF",
        marginBottom: 2,
    },
    footerValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#374151",
    },
});