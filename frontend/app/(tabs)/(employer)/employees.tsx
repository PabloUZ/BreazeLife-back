import { useCallback, useEffect, useState } from "react";
import {ActivityIndicator,FlatList,StyleSheet,Text,TouchableOpacity,View,} from "react-native";
import { useRouter } from "expo-router";
import { listEmployees } from "@/src/services/api/employeeService";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import EmployeeCard from "@/src/components/employer/employeeCard";
import { useFocusEffect } from "expo-router";
import type {
  EmployeeStatus,
  EmployerEmployeeDto,
} from "@/src/dtos/employer/employee.dtos";

const EMPLOYER_ID = "placeholder-employer-id";
const PAGE_SIZE = 10;

const STATUS_FILTERS: { label: string; value: EmployeeStatus | "ALL" }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Activos", value: "ACTIVE" },
  { label: "Inactivos", value: "INACTIVE" },
];

export default function EmployerEmployeesScreen() {
  const router = useRouter();

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
        if (replace) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        const response = await listEmployees(EMPLOYER_ID, {
          page,
          size: PAGE_SIZE,
          status: status === "ALL" ? undefined : status,
        });

        setEmployees((prev) =>
          replace ? response.content : [...prev, ...response.content]
        );
        setHasMore(!response.last);
        setCurrentPage(page);
      }catch (err) {
        console.error("Error cargando empleados:", err);
        setError("No se pudo cargar la lista de empleados. Intenta de nuevo.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
        fetchEmployees(0, selectedStatus, true);
    }, [selectedStatus, fetchEmployees])
);

  const handleStatusFilter = (status: EmployeeStatus | "ALL") => {
    if (status === selectedStatus) return;
    setSelectedStatus(status);
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    fetchEmployees(currentPage + 1, selectedStatus, false);
  };

  const handleRetry = () => {
    fetchEmployees(0, selectedStatus, true);
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Cargando empleados...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Empleados</Text>
          <Text style={styles.subtitle}>
            {employees.length} empleado{employees.length !== 1 ? "s" : ""} registrado
            {employees.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/(employer)/register-employee")}
        >
          <Text style={styles.addButtonText}>+ Registrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersRow}>
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterChip,
              selectedStatus === filter.value && styles.filterChipActive,
            ]}
            onPress={() => handleStatusFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === filter.value && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={employees}
        keyExtractor={(item) => item.contractId}
        renderItem={({ item }) => (
          <EmployeeCard
            employee={item}
            onPress={() => router.push({
              pathname: "/(tabs)/(employer)/employee-detail",
              params: { contractId: item.contractId },
            })}
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>Sin empleados</Text>
            <Text style={styles.emptySubtitle}>
              Aún no tienes empleados registrados.{"\n"}
              Toca "Registrar" para agregar el primero.
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color="#2563EB"
              style={styles.footerLoader}
            />
          ) : null
        }
      />
    </ScreenContainer>
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
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  addButton: {
    backgroundColor: "#369BC9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#369BC9",
  },
  filterChipText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#369BC9",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 16,
  },
});