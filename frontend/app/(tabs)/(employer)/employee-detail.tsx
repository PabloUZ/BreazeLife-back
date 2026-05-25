import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Alert } from "react-native";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import EmployeeDetail from "@/src/components/employer/employeeDetail";
import { getEmployeeDetail } from "@/src/services/api/employeeService";
import type { EmployeeDetailDto } from "@/src/dtos/employer/employee.dtos";
import { deactivateEmployee } from "@/src/services/api/employeeService";
import { useAuthContext } from "@/src/context/AuthContext";

export default function EmployeeDetailScreen() {
    const router = useRouter();
    const { state } = useAuthContext();
    const employerId = state.user?.user_id ?? "";
    const { contractId } = useLocalSearchParams<{ contractId: string }>();
    const [employee, setEmployee] = useState<EmployeeDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deactivating, setDeactivating] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (!contractId) return;
            fetchDetail();
        }, [contractId])
    );

    const fetchDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getEmployeeDetail(employerId, contractId);
            setEmployee(data);
        } catch (err: any) {
            if (err.message === "EMPLOYEE_NOT_FOUND") {
                setError("Empleado no encontrado.");
            } else if (err.message === "UNAUTHORIZED") {
                setError("No tienes permiso para ver este empleado.");
            } else {
                setError("No se pudo cargar el detalle. Intenta de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = () => {
        Alert.alert(
            "Desvincular empleado",
            `¿Estás seguro de que deseas desvincular a ${employee?.firstName} ${employee?.lastName}? Esta acción no se puede deshacer.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Desvincular",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setDeactivating(true);
                            await deactivateEmployee(employerId, contractId);
                            Alert.alert("Éxito", "Empleado desvinculado correctamente.", [
                                { text: "OK", onPress: () => router.push("/(tabs)/(employer)/employees" as any) }
                            ]);
                        } catch (err: any) {
                            if (err.message === "CONFLICT") {
                                Alert.alert("Error", "El empleado ya está inactivo.");
                            } else {
                                Alert.alert("Error", "No se pudo desvincular el empleado. Intenta de nuevo.");
                            }
                        } finally {
                            setDeactivating(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: employee
                        ? `${employee.firstName} ${employee.lastName}`
                        : "Detalle empleado",
                    headerShown: true,
                }}
            />
            <ScreenContainer>
                {loading && (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#2563EB" />
                        <Text style={styles.loadingText}>Cargando información...</Text>
                    </View>
                )}

                {error && !loading && (
                    <View style={styles.centered}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {employee && !loading && !error && (
                    <EmployeeDetail
                        employee={employee}
                        onEdit={() => router.push({
                            pathname: "/(tabs)/(employer)/edit-employee" as any,
                            params: { contractId: employee.contractId },
                        })}
                        onViewHistory={() => router.push({
                            pathname: "/(tabs)/(employer)/salary-history" as any,
                            params: { contractId: employee.contractId },
                        })}
                        onDeactivate={handleDeactivate}
                    />
                )}
            </ScreenContainer>
        </>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#6B7280",
    },
    errorText: {
        fontSize: 14,
        color: "#EF4444",
        textAlign: "center",
        paddingHorizontal: 24,
    },
});