import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import DateRangeFilter from "@/src/components/fund/DateRangeFilter";
import { PaymentCard } from "@/src/components/affiliate/PaymentCard";
import { getAffiliatePayments } from "@/src/services/api/affiliateService";
import type { AffiliatePaymentItemDto } from "@/src/dtos/affiliate/affiliate.dtos";

const STATUS_CHIPS = [
  { label: "Todos", value: "" },
  { label: "Procesados", value: "PROCESSED" },
  { label: "Pendientes", value: "PENDING" },
];

export default function AffiliatePaymentsScreen() {
  const router = useRouter();

  // Estados de datos
  const [payments, setPayments] = useState<AffiliatePaymentItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Paginación (1-indexed en el backend)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const fetchPayments = async (pageNumber: number, shouldReset: boolean = false) => {
    try {
      if (shouldReset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const res = await getAffiliatePayments({
        page: pageNumber,
        limit: 10,
        from: fromDate || undefined,
        to: toDate || undefined,
        status: selectedStatus || undefined,
      });

      const historyData = res.data;
      const fetchedItems = historyData.items || [];
      const totalPages = historyData.pagination.total_pages;

      if (shouldReset) {
        setPayments(fetchedItems);
      } else {
        setPayments((prev) => [...prev, ...fetchedItems]);
      }

      setPage(pageNumber);
      setTotalItems(historyData.pagination.total_items);
      setHasMore(pageNumber < totalPages);
    } catch (err) {
      setError("No se pudo cargar el historial de pagos. Intenta de nuevo.");
      console.error("Error fetching affiliate payments:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Recargar datos cuando cambien los filtros
  useEffect(() => {
    fetchPayments(1, true);
  }, [fromDate, toDate, selectedStatus]);

  // Recargar al entrar en foco (por si hubo ejecuciones de nómina nuevas)
  useFocusEffect(
    useCallback(() => {
      fetchPayments(1, true);
    }, [])
  );

  const handleDateRangeApply = (from: string | undefined, to: string | undefined) => {
    setFromDate(from);
    setToDate(to);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPayments(page + 1, false);
    }
  };

  const handleRetry = () => {
    fetchPayments(1, true);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Mis Pagos",
          headerShown: true,
        }}
      />
      <ScreenContainer>
        <FlatList
          data={payments}
          keyExtractor={(item) => item.payment_id}
          renderItem={({ item }) => (
            <PaymentCard
              payment={item}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/(affiliate)/payment-detail",
                  params: { paymentId: item.payment_id },
                } as any)
              }
            />
          )}
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <Text style={styles.sectionTitle}>Historial de Pagos Recibidos</Text>
              
              {/* Filtro de Rango de Fechas */}
              <DateRangeFilter onApply={handleDateRangeApply} />

              {/* Filtro por Estado */}
              <Text style={styles.filterLabel}>Filtrar por estado</Text>
              <View style={styles.statusRow}>
                {STATUS_CHIPS.map((chip) => (
                  <TouchableOpacity
                    key={chip.value}
                    style={[
                      styles.statusChip,
                      selectedStatus === chip.value && styles.statusChipActive,
                    ]}
                    onPress={() => setSelectedStatus(chip.value)}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        selectedStatus === chip.value && styles.statusChipTextActive,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.resultsCount}>
                {totalItems} {totalItems === 1 ? "pago encontrado" : "pagos encontrados"}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#369BC9" style={styles.footerLoader} />
            ) : (
              <View style={styles.bottomSpacing} />
            )
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.centeredState}>
                <ActivityIndicator size="large" color="#369BC9" />
                <Text style={styles.stateText}>Buscando tus pagos recibidos...</Text>
              </View>
            ) : error ? (
              <View style={styles.centeredState}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                  <Text style={styles.retryBtnText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No tienes pagos registrados en este período o estado.
                </Text>
              </View>
            )
          }
        />
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusChipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#369BC9",
  },
  statusChipText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  statusChipTextActive: {
    color: "#369BC9",
    fontWeight: "600",
  },
  resultsCount: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 4,
  },
  footerLoader: {
    paddingVertical: 16,
  },
  bottomSpacing: {
    height: 40,
  },
  centeredState: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: "#369BC9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
