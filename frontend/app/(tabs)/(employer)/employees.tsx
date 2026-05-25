import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import AppButton from "@/src/components/common/AppButton";
import AppEmptyState from "@/src/components/common/AppEmptyState";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import EmployeeCard from "@/src/components/employer/employeeCard";
import { useAuthContext } from "@/src/context/AuthContext";
import type {
  EmployeeStatus,
  EmployerEmployeeDto,
} from "@/src/dtos/employer/employee.dtos";
import { listEmployees } from "@/src/services/api/employeeService";
import { colors, formStyles, spacing } from "@/src/theme";

const PAGE_SIZE = 10;

const STATUS_FILTERS: { label: string; value: EmployeeStatus | "ALL" }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Activos", value: "ACTIVE" },
  { label: "Inactivos", value: "INACTIVE" },
];

export default function EmployerEmployeesScreen() {
  const router = useRouter();
  const { state } = useAuthContext();
  const employerId = state.user?.user_id ?? "";

  const [employees, setEmployees] = useState<EmployerEmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<EmployeeStatus | "ALL">("ALL");

  const fetchEmployees = useCallback(
    async (page: number, status: EmployeeStatus | "ALL", replace: boolean) => {
      try {
        if (replace) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError(null);

        const response = await listEmployees(employerId, {
          page,
          size: PAGE_SIZE,
          status: status === "ALL" ? undefined : status,
        });

        setEmployees((prev) =>
          replace ? response.content : [...prev, ...response.content]
        );
        setHasMore(!response.last);
        setCurrentPage(page);
      } catch {
        setError("No se pudo cargar la lista de empleados. Intenta de nuevo.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [employerId]
  );

  useFocusEffect(
    useCallback(() => {
      fetchEmployees(0, selectedStatus, true);
    }, [selectedStatus, fetchEmployees])
  );

  function handleLoadMore() {
    if (loadingMore || !hasMore) {
      return;
    }
    fetchEmployees(currentPage + 1, selectedStatus, false);
  }

  if (loading) {
    return (
      <ScreenContainer>
        <AppLoadingState message="Cargando empleados..." />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <AppErrorState message={error} onRetry={() => fetchEmployees(0, selectedStatus, true)} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader
        title="Empleados"
        subtitle={`${employees.length} empleado${employees.length !== 1 ? "s" : ""} registrado${employees.length !== 1 ? "s" : ""}.`}
        rightSlot={
          <AppButton
            title="Registrar"
            onPress={() => router.push("/(tabs)/(employer)/register-employee")}
          />
        }
      />

      <View style={styles.filtersRow}>
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterChip,
              selectedStatus === filter.value ? styles.filterChipActive : null,
            ]}
            onPress={() => setSelectedStatus(filter.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === filter.value ? styles.filterChipTextActive : null,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.contractId}
        renderItem={({ item }) => (
          <EmployeeCard
            employee={item}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/(employer)/employee-detail",
                params: { contractId: item.contractId },
              })
            }
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <AppEmptyState
            title="Sin empleados"
            description='Aun no tienes empleados registrados. Toca "Registrar" para agregar el primero.'
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.footerLoader}
            />
          ) : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filtersRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterChip: formStyles.chip,
  filterChipActive: formStyles.chipActive,
  filterChipText: formStyles.chipText,
  filterChipTextActive: formStyles.chipTextActive,
  footerLoader: {
    paddingVertical: spacing.md,
  },
});
