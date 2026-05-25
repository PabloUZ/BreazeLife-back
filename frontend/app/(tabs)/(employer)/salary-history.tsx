import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";
import { getSalaryHistory } from "@/src/services/api/employeeService";
import { SalaryHistoryResponseDto } from "@/src/dtos/employer/employee.dtos";
import ScreenContainer from "@/src/components/layout/ScreenContainer";

export default function SalaryHistoryScreen() {
    const { contractId } = useLocalSearchParams<{ contractId: string }>();
    const { state } = useAuth();

    const [history, setHistory] = useState<SalaryHistoryResponseDto[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async (pageNumber: number, reset: boolean = false) => {
        try {
            if (pageNumber === 0) setLoading(true);
            else setLoadingMore(true);

            const data = await getSalaryHistory(state.user!.user_id, contractId, pageNumber, 10);

            setHistory(prev => reset ? data.content : [...prev, ...data.content]);
            setTotalPages(data.totalPages);
            setPage(data.number);
        } catch (e) {
            setError("Error loading salary history.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchHistory(0, true);
    }, [contractId]);

    const loadMore = () => {
        if (!loadingMore && page + 1 < totalPages) {
            fetchHistory(page + 1);
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
    };

    const renderItem = ({ item }: { item: SalaryHistoryResponseDto }) => (
        <View style={styles.card}>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            <Text style={styles.action}>{item.action}</Text>
            <View style={styles.row}>
                <Text style={styles.label}>Cargo:</Text>
                <Text style={styles.value}>{item.position}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Salario:</Text>
                <Text style={styles.value}>{formatCurrency(item.salary)}</Text>
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            {loading && (
                <ActivityIndicator size="large" style={{ marginTop: 40 }} />
            )}

            {error && !loading && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            {!loading && !error && (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.historyId}
                    renderItem={renderItem}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={<Text style={styles.emptyText}>No hay historial disponible.</Text>}
                    ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    date: { fontSize: 12, color: "#888", marginBottom: 4 },
    action: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#333" },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    label: { fontSize: 14, color: "#555" },
    value: { fontSize: 14, fontWeight: "500", color: "#111" },
    emptyText: { textAlign: "center", marginTop: 40, color: "#888" },
    errorText: { textAlign: "center", marginTop: 40, color: "red" },
});