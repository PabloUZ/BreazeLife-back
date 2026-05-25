import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { EmployeeDetailDto } from "@/src/dtos/employer/employee.dtos";

type EmployeeDetailProps = {
    employee: EmployeeDetailDto;
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
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

function getStatusColor(status: string) {
    return status === "ACTIVE" ? "#16A34A" : "#EF4444";
}

function getStatusLabel(status: string): string {
    return status === "ACTIVE" ? "Activo" : "Inactivo";
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

export default function EmployeeDetail({ employee, onEdit, onViewHistory }: EmployeeDetailProps) {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
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
                <View style={[styles.statusBadge, { backgroundColor: employee.status === "ACTIVE" ? "#D1FAE5" : "#FEE2E2" }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(employee.status) }]}>
                        {getStatusLabel(employee.status)}
                    </Text>
                </View>
                <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                    <Text style={styles.editButtonText}>Editar información</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.historyButton} onPress={onViewHistory}>
                    <Text style={styles.historyButtonText}>Ver historial salarial</Text>
                </TouchableOpacity>
            </View>

            {/* Datos personales */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Datos personales</Text>
                <InfoRow label="Correo" value={employee.email} />
                <InfoRow label="Cédula" value={employee.document} />
                <InfoRow label="Fecha de nacimiento" value={formatDate(employee.birthDate)} />
            </View>

            {/* Datos laborales */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Datos laborales</Text>
                <InfoRow label="Empresa" value={employee.companyName} />
                <InfoRow label="Cargo" value={employee.position} />
                <InfoRow label="Salario base" value={formatSalary(employee.baseSalary)} />
                <InfoRow label="Fecha de vinculación" value={formatDate(employee.startDate)} />
                <InfoRow label="Fecha de retiro" value={formatDate(employee.endDate)} />
            </View>

            {/* Contrato */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contrato</Text>
                <InfoRow label="ID Contrato" value={employee.contractId} />
                <InfoRow label="ID Afiliado" value={employee.affiliateId} />
            </View>
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
        backgroundColor: "#4EA351",
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
    },
    position: {
        fontSize: 15,
        color: "#6B7280",
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
    },
    editButton: {
        marginTop: 16,
        backgroundColor: "#369BC9",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    editButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 14,
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
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F9FAFB",
    },
    infoLabel: {
        fontSize: 13,
        color: "#6B7280",
        flex: 1,
    },
    infoValue: {
        fontSize: 13,
        color: "#111827",
        fontWeight: "500",
        flex: 2,
        textAlign: "right",
    },
    historyButton: {
        marginTop: 8,
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    historyButtonText: {
        color: "#374151",
        fontWeight: "600",
        fontSize: 14,
    },
});