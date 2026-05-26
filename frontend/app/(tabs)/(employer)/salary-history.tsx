import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppButton from "@/src/components/common/AppButton";
import AppCard from "@/src/components/common/AppCard";
import AppEmptyState from "@/src/components/common/AppEmptyState";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import EmployerScreenContainer from "@/src/components/layout/EmployerScreenContainer";
import { useAuth } from "@/src/hooks/useAuth";
import type { SalaryHistoryResponseDto } from "@/src/dtos/employer/employee.dtos";
import { getSalaryHistory } from "@/src/services/api/employeeService";
import { colors, spacing, typography } from "@/src/theme";

export default function SalaryHistoryScreen() {
  const router = useRouter();
  const { contractId } = useLocalSearchParams<{ contractId: string }>();
  const { state } = useAuth();

  const [history, setHistory] = useState<SalaryHistoryResponseDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (pageNumber: number, reset = false) => {
    try {
      if (pageNumber === 0) setLoading(true);
      else setLoadingMore(true);

      setError(null);
      const data = await getSalaryHistory(state.user!.user_id, contractId, pageNumber, 10);

      setHistory((prev) => (reset ? data.content : [...prev, ...data.content]));
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch {
      setError("No se pudo cargar el historial salarial.");
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
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <EmployerScreenContainer>
        <AppLoadingState message="Cargando historial salarial..." />
      </EmployerScreenContainer>
    );
  }

  if (error) {
    return (
      <EmployerScreenContainer>
        <AppErrorState message={error} onRetry={() => fetchHistory(0, true)} />
      </EmployerScreenContainer>
    );
  }

  return (
    <EmployerScreenContainer>
      <View style={styles.topBar}>
        <AppButton
          title="Volver"
          variant="secondary"
          iconName="arrow-back-outline"
          onPress={() => router.back()}
        />
      </View>

      <AppHeader
        title="Historial salarial"
        subtitle="Consulta los cambios de salario y cargo registrados en el tiempo."
      />

      <FlatList
        data={history}
        keyExtractor={(item) => item.historyId}
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            <Text style={styles.action}>{item.action}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Cargo</Text>
              <Text style={styles.value} numberOfLines={2}>
                {item.position}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Salario</Text>
              <Text style={styles.value}>{formatCurrency(item.salary)}</Text>
            </View>
          </AppCard>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <AppEmptyState
            title="Sin historial"
            description="No hay cambios salariales registrados para este empleado."
          />
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={styles.loader} color={colors.primary} /> : null
        }
      />
    </EmployerScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: "flex-start",
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  card: {
    marginBottom: spacing.md,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  action: {
    ...typography.bodyStrong,
    marginBottom: spacing.md,
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
  },
  value: {
    ...typography.bodyStrong,
    color: colors.neutralText,
    flex: 1,
    textAlign: "right",
  },
  loader: {
    paddingVertical: spacing.lg,
  },
});
