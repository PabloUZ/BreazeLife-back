import { useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import ChangeSalaryPositionForm from "@/src/components/employer/changeSalaryPositionForm";
import { getEmployeeDetail } from "@/src/services/api/employeeService";
import type { EmployeeDetailDto } from "@/src/dtos/employer/employee.dtos";
import { useAuthContext } from "@/src/context/AuthContext";

export default function ChangeSalaryPositionScreen() {
    const { contractId } = useLocalSearchParams<{ contractId: string }>();
    const [employee, setEmployee] = useState<EmployeeDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const { state } = useAuthContext();
    const employerId = state.user?.user_id ?? "";
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!contractId) return;
        fetchDetail();
    }, [contractId]);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getEmployeeDetail(employerId, contractId);
            setEmployee(data);
        } catch {
            setError("No se pudo cargar la información del empleado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Cambiar cargo y salario",
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
                    <ChangeSalaryPositionForm employee={employee} />
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